import os
import shutil
import glob
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

WEIGHTS_DIR = "/content/Applio/logs"
DRIVE_DIR = "/content/drive/MyDrive/VoiceForge/models"

class SyncRequest(BaseModel):
    model_name: str

@router.post("/drive/sync")
async def sync_to_drive(req: SyncRequest):
    if not os.path.exists("/content/drive/MyDrive"):
        raise HTTPException(status_code=400, detail="Google Drive not mounted. Run drive.mount() in Colab first.")

    os.makedirs(DRIVE_DIR, exist_ok=True)

    # Find model files
    model_dir = os.path.join(WEIGHTS_DIR, req.model_name)
    if os.path.isdir(model_dir):
        dest = os.path.join(DRIVE_DIR, req.model_name)
        if os.path.exists(dest):
            shutil.rmtree(dest)
        shutil.copytree(model_dir, dest)
        return {"message": f"Synced {req.model_name} to Drive", "path": dest}

    # Check direct .pth file
    pth = os.path.join(WEIGHTS_DIR, f"{req.model_name}.pth")
    if os.path.exists(pth):
        dest_dir = os.path.join(DRIVE_DIR, req.model_name)
        os.makedirs(dest_dir, exist_ok=True)
        shutil.copy2(pth, dest_dir)
        idx = pth.replace(".pth", ".index")
        if os.path.exists(idx):
            shutil.copy2(idx, dest_dir)
        return {"message": f"Synced {req.model_name} to Drive", "path": dest_dir}

    raise HTTPException(status_code=404, detail="Model not found")
