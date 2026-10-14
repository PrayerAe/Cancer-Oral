"""
AI Inference Engine for Oral Cancer Detection
Handles model loading, preprocessing, and prediction
"""

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import numpy as np
import asyncio
import logging
from datetime import datetime
from typing import Dict, Any
import os
import requests
import tempfile

logger = logging.getLogger(__name__)

class MobileNetV2Model(nn.Module):
    """Enhanced MobileNetV2 model for oral cancer detection"""
    
    def __init__(self, num_classes=2):
        super(MobileNetV2Model, self).__init__()
        self.mobilenet = models.mobilenet_v2(pretrained=False)
        self.mobilenet.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(self.mobilenet.last_channel, num_classes)
        )
    
    def forward(self, x):
        return self.mobilenet(x)

class AIInferenceEngine:
    """Production-ready AI inference engine"""
    
    def __init__(self):
        self.model = None
        self.device = torch.device('cpu')  # Use CPU for serverless compatibility
        self.transform = None
        self.is_initialized = False
        self.start_time = datetime.now()
        
        # Setup image preprocessing pipeline
        self.setup_preprocessing()
    
    def setup_preprocessing(self):
        """Setup image preprocessing pipeline"""
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    async def initialize(self):
        """Initialize the AI model"""
        try:
            logger.info("🔄 Initializing AI inference engine...")
            
            # Initialize model architecture
            self.model = MobileNetV2Model(num_classes=2)
            
            # Load model weights
            model_path = await self.get_model_path()
            
            if os.path.exists(model_path):
                logger.info("📦 Loading model weights...")
                checkpoint = torch.load(model_path, map_location=self.device)
                
                if 'state_dict' in checkpoint:
                    self.model.load_state_dict(checkpoint['state_dict'])
                else:
                    self.model.load_state_dict(checkpoint)
                
                logger.info("✅ Model weights loaded successfully")
            else:
                logger.warning("⚠️ Model file not found - using random weights for demo")
            
            # Set model to evaluation mode
            self.model.to(self.device)
            self.model.eval()
            
            # Warm up model with dummy input
            await self.warmup_model()
            
            self.is_initialized = True
            logger.info("✅ AI inference engine initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize AI engine: {e}")
            raise
    
    async def get_model_path(self) -> str:
        """Get model path, download if necessary"""
        local_model_path = "models/mobilenetv2_best.pth"
        
        # If model exists locally, use it
        if os.path.exists(local_model_path):
            return local_model_path
        
        # Try to download from environment variable URL
        model_url = os.environ.get('MODEL_URL')
        if model_url:
            try:
                logger.info(f"📥 Downloading model from {model_url}")
                
                # Create temp file
                temp_model = tempfile.NamedTemporaryFile(delete=False, suffix='.pth')
                
                # Download model
                response = requests.get(model_url, stream=True)
                response.raise_for_status()
                
                for chunk in response.iter_content(chunk_size=8192):
                    temp_model.write(chunk)
                
                temp_model.close()
                
                logger.info("✅ Model downloaded successfully")
                return temp_model.name
                
            except Exception as e:
                logger.error(f"❌ Failed to download model: {e}")
        
        return local_model_path
    
    async def warmup_model(self):
        """Warm up model with dummy input to improve first prediction speed"""
        try:
            dummy_input = torch.randn(1, 3, 224, 224).to(self.device)
            with torch.no_grad():
                _ = self.model(dummy_input)
            logger.info("🔥 Model warmed up successfully")
        except Exception as e:
            logger.warning(f"⚠️ Model warmup failed: {e}")
    
    def is_loaded(self) -> bool:
        """Check if model is loaded and ready"""
        return self.is_initialized and self.model is not None
    
    async def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Perform AI prediction on medical image
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing prediction results
        """
        if not self.is_loaded():
            raise RuntimeError("AI model not initialized")
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            input_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Perform inference
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                _, predicted = torch.max(outputs.data, 1)
            
            # Extract results
            confidence = probabilities[0][predicted].item() * 100
            prediction = 'Cancer' if predicted.item() == 1 else 'Non-Cancer'
            
            non_cancer_prob = probabilities[0][0].item() * 100
            cancer_prob = probabilities[0][1].item() * 100
            
            result = {
                'prediction': prediction,
                'confidence': confidence,
                'probabilities': {
                    'non_cancer': non_cancer_prob,
                    'cancer': cancer_prob
                },
                'model_output': outputs.cpu().numpy(),  # For Grad-CAM
                'predicted_class': predicted.item()
            }
            
            logger.info(f"🎯 Prediction: {prediction} ({confidence:.2f}% confidence)")
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            raise RuntimeError(f"Prediction failed: {str(e)}")
