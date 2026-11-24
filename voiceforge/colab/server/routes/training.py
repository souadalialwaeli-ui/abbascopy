from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
import asyncio
import subprocess
import threading
import json

router = APIRouter()

DATASETS_DIR = "/content/Applio/assets/datasets"
APPLIO_DIR = "/content/Applio"

class PreprocessConfig(BaseModel):
    model_name: str
    sample_rate: int = 40000

class ExtractConfig(BaseModel):
    model_name: str
    f0_method: str = "rmvpe"
    sample_rate: int = 40000

class TrainConfig(BaseModel):
    model_name: str
    sample_rate: str = "40000"
    f0_method: str = "rmvpe"
    epochs: int = 100
    batch_size: int = 8
    save_frequency: int = 25

# Global training state
training_state = {
    "active": False,
    "process": None,
    "status": "idle",
    "epoch": 0,
    "total_epochs": 0,
    "loss_g": 0.0,
    "loss_d": 0.0,
    "message": "",
}

@router.post("/training/upload-dataset")
async def upload_dataset(
    model_name: str = Form(...),
    files: List[UploadFile] = File(...)
):
    dataset_dir = os.path.join(DATASETS_DIR, model_name)
    os.makedirs(dataset_dir, exist_ok=True)

    saved = []
    for file in files:
        dest = os.path.join(dataset_dir, file.filename)
        with open(dest, "wb") as f:
            content = await file.read()
            f.write(content)
        saved.append(file.filename)

    return {
        "message": f"Uploaded {len(saved)} files to {model_name}",
        "dataset_dir": dataset_dir,
        "files": saved,
    }

@router.post("/training/preprocess")
async def preprocess(config: PreprocessConfig):
    try:
        cmd = [
            sys.executable, os.path.join(APPLIO_DIR, "core.py"),
            "preprocess",
            "--model-name", config.model_name,
            "--sample-rate", str(config.sample_rate),
            "--dataset-path", os.path.join(DATASETS_DIR, config.model_name),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Preprocess failed: {result.stderr[-500:]}")

        return {"message": "Preprocessing completed", "output": result.stdout[-500:]}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Preprocessing timed out")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/training/extract-features")
async def extract_features(config: ExtractConfig):
    try:
        cmd = [
            sys.executable, os.path.join(APPLIO_DIR, "core.py"),
            "extract",
            "--model-name", config.model_name,
            "--f0-method", config.f0_method,
            "--sample-rate", str(config.sample_rate),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=1200)

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Feature extraction failed: {result.stderr[-500:]}")

        return {"message": "Feature extraction completed", "output": result.stdout[-500:]}
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Feature extraction timed out")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/training/start")
async def start_training(config: TrainConfig, request: Request):
    global training_state

    if training_state["active"]:
        raise HTTPException(status_code=409, detail="Training already in progress")

    training_state["active"] = True
    training_state["status"] = "training"
    training_state["total_epochs"] = config.epochs
    training_state["epoch"] = 0

    ws_manager = request.app.state.ws_manager

    def run_training():
        global training_state
        try:
            cmd = [
                sys.executable, os.path.join(APPLIO_DIR, "core.py"),
                "train",
                "--model-name", config.model_name,
                "--sample-rate", str(config.sample_rate),
                "--total-epoch", str(config.epochs),
                "--batch-size", str(config.batch_size),
                "--save-every-epoch", str(config.save_frequency),
            ]

            process = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                text=True, bufsize=1
            )
            training_state["process"] = process

            for line in process.stdout:
                line = line.strip()
                if not line:
                    continue

                # Parse training output for progress
                if "Epoch" in line or "epoch" in line:
                    try:
                        parts = line.split()
                        for i, p in enumerate(parts):
                            if "epoch" in p.lower() and i + 1 < len(parts):
                                epoch_str = parts[i + 1].strip(":/[]")
                                if "/" in epoch_str:
                                    current, total = epoch_str.split("/")
                                    training_state["epoch"] = int(current)
                                    training_state["total_epochs"] = int(total)
                                else:
                                    training_state["epoch"] = int(epoch_str)
                    except:
                        pass

                if "loss_gen" in line or "loss_g" in line:
                    try:
                        for part in line.split(","):
                            if "loss_gen" in part or "loss_g" in part:
                                training_state["loss_g"] = float(part.split(":")[-1].strip())
                            if "loss_disc" in part or "loss_d" in part:
                                training_state["loss_d"] = float(part.split(":")[-1].strip())
                    except:
                        pass

                training_state["message"] = line[-100:]
                percentage = (training_state["epoch"] / max(training_state["total_epochs"], 1)) * 100
                training_state["percentage"] = percentage

                # Broadcast via WebSocket
                import asyncio
                try:
                    loop = asyncio.get_event_loop()
                    if loop.is_running():
                        asyncio.ensure_future(ws_manager.broadcast({
                            "type": "training_progress",
                            "payload": {
                                "epoch": training_state["epoch"],
                                "totalEpochs": training_state["total_epochs"],
                                "loss_g": training_state["loss_g"],
                                "loss_d": training_state["loss_d"],
                                "status": "training",
                                "message": training_state["message"],
                                "percentage": percentage,
                            }
                        }))
                except:
                    pass

            process.wait()
            training_state["status"] = "completed" if process.returncode == 0 else "error"

        except Exception as e:
            training_state["status"] = "error"
            training_state["message"] = str(e)
        finally:
            training_state["active"] = False
            training_state["process"] = None

    thread = threading.Thread(target=run_training, daemon=True)
    thread.start()

    return {"message": "Training started", "api_key_reminder": "Monitor via WebSocket /ws"}

@router.post("/training/stop")
async def stop_training():
    global training_state
    if training_state["process"]:
        training_state["process"].terminate()
        training_state["active"] = False
        training_state["status"] = "idle"
        return {"message": "Training stopped"}
    raise HTTPException(status_code=404, detail="No active training")

@router.get("/training/status")
async def training_status():
    return {
        "active": training_state["active"],
        "status": training_state["status"],
        "epoch": training_state["epoch"],
        "total_epochs": training_state["total_epochs"],
        "loss_g": training_state["loss_g"],
        "loss_d": training_state["loss_d"],
        "message": training_state["message"],
    }
