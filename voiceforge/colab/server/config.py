import os
import secrets
import torch

# Server config
HOST = "0.0.0.0"
PORT = 8000
API_KEY = os.environ.get("VOICEFORGE_API_KEY", secrets.token_urlsafe(16))

# Paths
APPLIO_DIR = "/content/Applio"
MODELS_DIR = os.path.join(APPLIO_DIR, "logs")
DATASETS_DIR = os.path.join(APPLIO_DIR, "assets", "datasets")
WEIGHTS_DIR = os.path.join(APPLIO_DIR, "logs")
UPLOAD_DIR = "/content/uploads"
OUTPUT_DIR = "/content/outputs"
DRIVE_DIR = "/content/drive/MyDrive/VoiceForge"

# GPU
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
IS_GPU = torch.cuda.is_available()
GPU_NAME = torch.cuda.get_device_name(0) if IS_GPU else "N/A"
GPU_MEMORY = f"{getattr(torch.cuda.get_device_properties(0), 'total_memory', 0) / 1024**3:.1f} GB" if IS_GPU else "N/A"

# Firebase (optional)
FIREBASE_DB_URL = os.environ.get("FIREBASE_DB_URL", "")

# Ensure directories
for d in [UPLOAD_DIR, OUTPUT_DIR, DATASETS_DIR]:
    os.makedirs(d, exist_ok=True)
