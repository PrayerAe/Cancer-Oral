"""
AI Oral Cancer Detection API Package
Production-ready medical AI system with FastAPI backend
"""

__version__ = "2.0.0"
__author__ = "AI Medical Solutions"
__description__ = "Production-grade AI API for oral cancer detection"

# Package imports for easy access
from .main import app
from .inference import AIInferenceEngine, MobileNetV2Model
from .gradcam import GradCAMVisualizer
from .storage import StorageManager
from .security import SecurityManager
from .config import Settings

__all__ = [
    "app",
    "AIInferenceEngine", 
    "MobileNetV2Model",
    "GradCAMVisualizer",
    "StorageManager",
    "SecurityManager",
    "Settings"
]
