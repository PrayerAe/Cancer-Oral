import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import cv2

class GradCAM:
    def __init__(self, model):
        self.model = model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.gradients = None
        self.activations = None
        self.hook_handles = []
    
    def _register_hooks(self, target_layer):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            if grad_output[0] is not None:
                self.gradients = grad_output[0].detach()

        handle1 = target_layer.register_forward_hook(forward_hook)
        handle2 = target_layer.register_backward_hook(backward_hook)
        self.hook_handles.extend([handle1, handle2])
    
    def find_last_conv_layer(self):
        """Find the last convolutional layer in the model"""
        for layer in reversed(list(self.model.features.modules())):
            if isinstance(layer, nn.Conv2d):
                return layer
        raise ValueError("No Conv2d layer found in model")
    
    def generate_heatmap(self, input_tensor, class_idx=None):
        """Generate GradCAM heatmap"""
        try:
            # Find and register hooks on last conv layer
            target_layer = self.find_last_conv_layer()
            self._register_hooks(target_layer)
            
            self.model.eval()
            output = self.model(input_tensor)
            
            if class_idx is None:
                class_idx = output.argmax(dim=1).item()
            
            self.model.zero_grad()
            target = output[0, class_idx]
            target.backward(retain_graph=True)
            
            if self.gradients is None:
                print("Warning: No gradients captured, returning zero heatmap")
                return np.zeros((224, 224))
            
            # Calculate GradCAM
            weights = self.gradients.mean(dim=(2, 3), keepdim=True)
            cam = (weights * self.activations).sum(dim=1, keepdim=True)
            cam = F.relu(cam)
            cam = F.interpolate(cam, size=(224, 224), mode='bilinear', align_corners=False)
            cam = cam.squeeze().cpu().numpy()
            
            # Normalize
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
            
            # Cleanup hooks
            self.cleanup()
            
            return cam
            
        except Exception as e:
            print(f"Error generating GradCAM: {e}")
            self.cleanup()
            return np.zeros((224, 224))
    
    def cleanup(self):
        """Remove all registered hooks"""
        for handle in self.hook_handles:
            handle.remove()
        self.hook_handles = []
