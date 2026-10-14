# api/index.py
import os
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, request, render_template, jsonify, send_file
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import cv2
import numpy as np
import base64
import pickle
import tempfile
import logging
from datetime import datetime
import io
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt

# Import utils (adjust path as needed)
from utils.pdf_generator import modern_simple_premium_pdf_generator

# Initialize Flask app
app = Flask(__name__, 
            template_folder='../templates',
            static_folder='../static')

# Configure upload folder
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f'Using device: {device}')

# Model configuration
class MobileNetV2Model(nn.Module):
    def __init__(self, num_classes=2):
        super(MobileNetV2Model, self).__init__()
        self.mobilenet = models.mobilenet_v2(pretrained=False)
        self.mobilenet.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(self.mobilenet.last_channel, num_classes)
        )
    
    def forward(self, x):
        return self.mobilenet(x)

# Initialize model
model = None

def load_model():
    global model
    try:
        model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'MobilenetV2_best_model_20250716.pth')
        
        if not os.path.exists(model_path):
            logger.error(f"Model file not found at: {model_path}")
            return False
            
        model = MobileNetV2Model(num_classes=2)
        
        # Load model weights
        checkpoint = torch.load(model_path, map_location=device)
        if 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'])
        else:
            model.load_state_dict(checkpoint)
        
        model.to(device)
        model.eval()
        
        logger.info("Model loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        return False

# Load model on startup
load_model()

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded',
                'error_code': 'MODEL_NOT_LOADED'
            }), 500

        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file uploaded',
                'error_code': 'NO_FILE'
            }), 400

        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'error_code': 'NO_FILE_SELECTED'
            }), 400

        # Process image
        image = Image.open(file.stream).convert('RGB')
        image_array = np.array(image)
        
        # Preprocess for model
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            _, predicted = torch.max(outputs.data, 1)
            
            confidence = probabilities[0][predicted].item() * 100
            prediction = 'Cancer' if predicted.item() == 1 else 'Non-Cancer'

        # Convert images to base64 for response
        original_img_b64 = image_to_base64(image_array)
        
        # Create simple heatmap (placeholder for actual Grad-CAM)
        heatmap_img_b64 = create_simple_heatmap(image_array)
        overlay_img_b64 = create_simple_overlay(image_array)
        
        # Prepare result data
        result_data = {
            'success': True,
            'prediction': prediction,
            'confidence': round(confidence, 2),
            'probabilities': {
                'non_cancer': round(probabilities[0][0].item() * 100, 2),
                'cancer': round(probabilities[0][1].item() * 100, 2)
            },
            'original_img': original_img_b64,
            'heatmap_img': heatmap_img_b64,
            'overlay_img': overlay_img_b64,
            'analysis_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'patient_data': {
                'name': request.form.get('patient_name', ''),
                'age': request.form.get('patient_age', ''),
                'gender': request.form.get('patient_gender', ''),
                'doctor_name': request.form.get('doctor_name', ''),
                'hospital': request.form.get('hospital', ''),
                'medical_history': request.form.get('medical_history', ''),
                'symptoms': request.form.get('symptoms', '')
            }
        }
        
        # Save result to temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        result_filename = f"result_{timestamp}.pkl"
        result_path = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
        
        with open(result_path, 'wb') as f:
            pickle.dump(result_data, f)
        
        result_data['result_file'] = result_filename
        
        logger.info(f"Analysis completed: {prediction} ({confidence:.2f}% confidence)")
        
        return jsonify(result_data)
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'error_code': 'PREDICTION_ERROR'
        }), 500

@app.route('/download_pdf/<result_file>')
def download_pdf(result_file):
    """Download PDF report"""
    try:
        result_path = os.path.join(app.config['UPLOAD_FOLDER'], result_file)
        if not os.path.exists(result_path):
            return jsonify({
                'error': 'Analysis results not found',
                'error_code': 'RESULT_NOT_FOUND'
            }), 404

        # Load result data
        with open(result_path, 'rb') as f:
            result_data = pickle.load(f)

        if modern_simple_premium_pdf_generator is None:
            return jsonify({
                'error': 'PDF generator not available',
                'error_code': 'PDF_GENERATOR_NOT_AVAILABLE'
            }), 500

        # Generate PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"Laporan_Medis_AI_Kanker_Mulut_{timestamp}.pdf"
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)

        success = modern_simple_premium_pdf_generator.generate_professional_pdf(result_data, pdf_path)

        if os.path.exists(pdf_path) and success:
            return send_file(
                pdf_path, 
                as_attachment=True,
                download_name=pdf_filename,
                mimetype='application/pdf'
            )
        else:
            return jsonify({
                'error': 'PDF generation failed',
                'error_code': 'PDF_GENERATION_FAILED'
            }), 500

    except Exception as e:
        logger.error(f"PDF download error: {e}")
        return jsonify({
            'error': f'PDF download failed: {str(e)}',
            'error_code': 'PDF_DOWNLOAD_ERROR'
        }), 500

def image_to_base64(image_array):
    """Convert numpy image array to base64 string"""
    try:
        image = Image.fromarray(image_array.astype('uint8'))
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return img_str
    except:
        return ""

def create_simple_heatmap(image_array):
    """Create a simple heatmap placeholder"""
    try:
        # Create a simple gradient heatmap
        height, width = image_array.shape[:2]
        heatmap = np.random.rand(height, width) * 255
        heatmap = heatmap.astype(np.uint8)
        
        # Apply colormap
        heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        return image_to_base64(heatmap_colored)
    except:
        return ""

def create_simple_overlay(image_array):
    """Create a simple overlay placeholder"""
    try:
        # Create simple overlay by blending
        heatmap = np.random.rand(image_array.shape[0], image_array.shape[1]) * 255
        heatmap = heatmap.astype(np.uint8)
        heatmap_colored = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Blend with original image
        overlay = cv2.addWeighted(image_array, 0.7, heatmap_colored, 0.3, 0)
        
        return image_to_base64(overlay)
    except:
        return ""

# For Vercel deployment
def handler(request):
    """Vercel handler function"""
    return app(request.environ, lambda *args: None)

if __name__ == '__main__':
    app.run(debug=True)
