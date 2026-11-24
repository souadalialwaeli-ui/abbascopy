from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import os
import sys
import tempfile
import uuid
import subprocess

router = APIRouter()

OUTPUT_DIR = "/content/outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)

@router.post("/inference")
async def run_inference(
    audio: UploadFile = File(...),
    pth_path: str = Form(...),
    index_path: str = Form(""),
    pitch: int = Form(0),
    f0_method: str = Form("rmvpe"),
    index_rate: float = Form(0.5),
    filter_radius: int = Form(3),
    volume_envelope: float = Form(0.25),
    protect_voiceless: float = Form(0.33),
):
    try:
        # Save uploaded audio to temp file
        input_ext = os.path.splitext(audio.filename)[1] or ".wav"
        input_path = os.path.join(OUTPUT_DIR, f"input_{uuid.uuid4().hex}{input_ext}")
        with open(input_path, "wb") as f:
            content = await audio.read()
            f.write(content)

        # Output path
        output_path = os.path.join(OUTPUT_DIR, f"output_{uuid.uuid4().hex}.wav")

        # Build command using Applio's core.py CLI
        cmd = [
            sys.executable, "/content/Applio/core.py",
            "infer",
            "--input-path", input_path,
            "--output-path", output_path,
            "--pth-path", pth_path,
            "--pitch", str(pitch),
            "--f0-method", f0_method,
            "--index-rate", str(index_rate),
            "--filter-radius", str(filter_radius),
            "--volume-envelope", str(volume_envelope),
            "--protect", str(protect_voiceless),
        ]

        if index_path:
            cmd.extend(["--index-path", index_path])

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

        if result.returncode != 0:
            # Cleanup
            if os.path.exists(input_path):
                os.remove(input_path)
            raise HTTPException(status_code=500, detail=f"Inference failed: {result.stderr[-500:]}")

        # Cleanup input
        if os.path.exists(input_path):
            os.remove(input_path)

        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Output file not generated")

        return FileResponse(
            output_path,
            media_type="audio/wav",
            filename=f"voiceforge_{uuid.uuid4().hex[:8]}.wav",
            background=None,  # Will be cleaned up later
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
