from fastapi import APIRouter
import torch
import psutil
import os

router = APIRouter()

@router.get("/status")
async def get_status():
    gpu_info = "N/A"
    gpu_memory_used = "N/A"
    gpu_memory_total = "N/A"

    if torch.cuda.is_available():
        gpu_info = torch.cuda.get_device_name(0)
        mem = torch.cuda.mem_get_info(0)
        gpu_memory_used = f"{(mem[1] - mem[0]) / 1024**3:.1f} GB"
        gpu_memory_total = f"{mem[1] / 1024**3:.1f} GB"

    ram = psutil.virtual_memory()

    return {
        "status": "online",
        "gpu": gpu_info,
        "gpu_memory_used": gpu_memory_used,
        "gpu_memory_total": gpu_memory_total,
        "ram_used": f"{ram.used / 1024**3:.1f} GB",
        "ram_total": f"{ram.total / 1024**3:.1f} GB",
        "cpu_percent": psutil.cpu_percent(),
        "disk_free": f"{psutil.disk_usage('/').free / 1024**3:.1f} GB",
        "cuda_available": torch.cuda.is_available(),
        "applio_installed": os.path.exists("/content/Applio/core.py"),
    }
