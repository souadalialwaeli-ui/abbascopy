import sys
import os
import asyncio
import json
import nest_asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Apply nest_asyncio for Colab/Jupyter
nest_asyncio.apply()

# Add Applio to path
sys.path.insert(0, "/content/Applio")

from config import HOST, PORT, API_KEY
from routes.status import router as status_router
from routes.models import router as models_router
from routes.inference import router as inference_router
from routes.training import router as training_router

app = FastAPI(title="VoiceForge API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(status_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(inference_router, prefix="/api")
app.include_router(training_router, prefix="/api")

# WebSocket for training progress
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Make manager accessible to routes
app.state.ws_manager = manager

@app.on_event("startup")
async def startup():
    print(f"\n{'='*50}")
    print(f"  VoiceForge API Server")
    print(f"  API Key: {API_KEY}")
    print(f"{'='*50}\n")

def start_server():
    """Start the server - called from notebook"""
    uvicorn.run(app, host=HOST, port=PORT)

if __name__ == "__main__":
    start_server()
