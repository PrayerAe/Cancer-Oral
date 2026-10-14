import torch
import torch.nn as nn
from torchvision import models

class ModelLoader:
    def __init__(self, model_path):
        self.model_path = model_path
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    def load_model(self):
        """Load the trained MobileNetV2 model"""
        try:
            # Create model architecture
            model = models.mobilenet_v2(pretrained=False)
            
            # Freeze feature layers
            for param in model.features.parameters():
                param.requires_grad = False
            
            # Modify classifier
            num_ftrs = model.classifier[1].in_features
            model.classifier = nn.Sequential(
                nn.Dropout(p=0.3),
                nn.Linear(num_ftrs, 2)  # Cancer, Non-Cancer
            )
            
            # Load trained weights
            model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            model.to(self.device)
            model.eval()
            
            print(f"Model loaded successfully from {self.model_path}")
            return model
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise e
    
    def get_model_info(self):
        """Get model information"""
        return {
            'architecture': 'MobileNetV2',
            'classes': ['Non-Cancer', 'Cancer'],
            'input_size': (224, 224),
            'device': str(self.device)
        }
