from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import glob
import shutil
import subprocess

router = APIRouter()

MODELS_BASE = "/content/Applio/logs"
WEIGHTS_DIR = "/content/Applio/logs"

class DownloadRequest(BaseModel):
    url: str
    name: Optional[str] = None

@router.get("/models")
async def list_models():
    models = []
    if not os.path.exists(WEIGHTS_DIR):
        return {"models": []}

    for entry in os.listdir(WEIGHTS_DIR):
        model_dir = os.path.join(WEIGHTS_DIR, entry)
        if not os.path.isdir(model_dir):
            continue

        pth_files = glob.glob(os.path.join(model_dir, "*.pth"))
        index_files = glob.glob(os.path.join(model_dir, "*.index"))

        if pth_files:
            models.append({
                "name": entry,
                "pth_path": pth_files[0],
                "index_path": index_files[0] if index_files else None,
                "size_mb": round(os.path.getsize(pth_files[0]) / 1024 / 1024, 1),
            })

    # Also check for direct .pth files in weights dir
    for pth in glob.glob(os.path.join(WEIGHTS_DIR, "*.pth")):
        name = os.path.splitext(os.path.basename(pth))[0]
        if not any(m["name"] == name for m in models):
            idx = pth.replace(".pth", ".index")
            models.append({
                "name": name,
                "pth_path": pth,
                "index_path": idx if os.path.exists(idx) else None,
                "size_mb": round(os.path.getsize(pth) / 1024 / 1024, 1),
            })

    return {"models": models}

@router.post("/models/upload")
async def upload_model(files: List[UploadFile] = File(...)):
    saved = []
    for file in files:
        dest = os.path.join(WEIGHTS_DIR, file.filename)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            content = await file.read()
            f.write(content)
        saved.append(file.filename)
    return {"message": f"Uploaded {len(saved)} files", "files": saved}

@router.post("/models/download")
async def download_model(req: DownloadRequest):
    try:
        name = req.name or "downloaded_model"
        dest_dir = os.path.join(WEIGHTS_DIR, name)
        os.makedirs(dest_dir, exist_ok=True)

        if "huggingface.co" in req.url:
            subprocess.run(["wget", "-q", req.url, "-P", dest_dir], check=True)
        else:
            subprocess.run(["wget", "-q", req.url, "-P", dest_dir], check=True)

        return {"message": f"Model downloaded to {dest_dir}", "path": dest_dir}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/models/{model_name}")
async def delete_model(model_name: str):
    model_dir = os.path.join(WEIGHTS_DIR, model_name)
    if os.path.isdir(model_dir):
        shutil.rmtree(model_dir)
        return {"message": f"Deleted {model_name}"}

    pth = os.path.join(WEIGHTS_DIR, f"{model_name}.pth")
    if os.path.exists(pth):
        os.remove(pth)
        idx = pth.replace(".pth", ".index")
        if os.path.exists(idx):
            os.remove(idx)
        return {"message": f"Deleted {model_name}"}

    raise HTTPException(status_code=404, detail="Model not found")
