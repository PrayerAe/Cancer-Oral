"""
Debug script untuk test PDF generation
"""

import sys
import os
sys.path.append('.')

from utils.pdf_generator import medical_pdf_generator
from datetime import datetime

def test_pdf_generation():
    """Test PDF generation with sample data"""
    
    if medical_pdf_generator is None:
        print("PDF generator not available")
        return False
    
    # Sample test data
    test_data = {
        'prediction': 'Cancer',
        'confidence': 91.92,
        'probabilities': {
            'non_cancer': 8.08,
            'cancer': 91.92
        },
        'analysis_date': '2025-08-12 00:07:41',
        'patient_data': {
            'name': 'Test Patient',
            'age': '45',
            'gender': 'Male',
            'doctor_name': 'Dr. Test',
            'hospital': 'Test Hospital'
        },
        'analysis_metadata': {
            'processing_time': '0.27s',
            'model_confidence': 'Very High',
            'image_quality': 'Good',
            'heatmap_method': 'Enhanced Grad-CAM'
        },
        'technical_details': {
            'input_resolution': '224x224',
            'inference_device': 'CUDA',
            'grad_cam_target_layer': 'Auto-detected'
        }
    }
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = f'static/uploads/DEBUG_PDF_Test_{timestamp}.pdf'
    
    print(f"Testing PDF generation: {output_path}")
    
    success = medical_pdf_generator.generate_professional_pdf(test_data, output_path)
    
    if success:
        print("PDF test successful!")
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"File size: {size} bytes")
    else:
        print("PDF test failed!")
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            print(f"File exists but size: {size} bytes")
    
    return success

if __name__ == "__main__":
    test_pdf_generation()
