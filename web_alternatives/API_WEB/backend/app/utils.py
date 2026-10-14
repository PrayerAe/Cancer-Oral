"""
Utility Functions for AI Oral Cancer Detection API
Common helper functions and utilities
"""

import hashlib
import mimetypes
import os
import re
import uuid
from typing import Optional, Tuple, List
from PIL import Image
import logging

logger = logging.getLogger(__name__)

def generate_secure_filename(original_filename: str, prefix: str = "") -> str:
    """Generate secure filename with UUID"""
    # Get file extension
    _, ext = os.path.splitext(original_filename)
    
    # Generate UUID-based filename
    unique_id = str(uuid.uuid4())
    
    # Combine with prefix if provided
    if prefix:
        filename = f"{prefix}_{unique_id}{ext}"
    else:
        filename = f"{unique_id}{ext}"
    
    return filename

def validate_image_file(file_path: str) -> Tuple[bool, str]:
    """Validate image file format and properties"""
    try:
        # Check if file exists
        if not os.path.exists(file_path):
            return False, "File does not exist"
        
        # Check file size (max 16MB)
        file_size = os.path.getsize(file_path)
        if file_size > 16 * 1024 * 1024:
            return False, "File size exceeds 16MB limit"
        
        # Validate MIME type
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type or not mime_type.startswith('image/'):
            return False, "Invalid image format"
        
        # Try to open with PIL
        with Image.open(file_path) as img:
            # Check image dimensions
            width, height = img.size
            if width < 50 or height < 50:
                return False, "Image too small (minimum 50x50 pixels)"
            
            if width > 4000 or height > 4000:
                return False, "Image too large (maximum 4000x4000 pixels)"
            
            # Check if image is corrupted
            img.verify()
        
        return True, "Valid image file"
        
    except Exception as e:
        return False, f"Image validation failed: {str(e)}"

def calculate_file_hash(file_path: str) -> str:
    """Calculate SHA256 hash of file"""
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"❌ Error calculating file hash: {e}")
        return ""

def sanitize_patient_data(data: dict) -> dict:
    """Sanitize patient data for security"""
    sanitized = {}
    
    # Safe fields that we allow
    safe_fields = [
        'patient_name', 'patient_age', 'patient_gender',
        'doctor_name', 'hospital', 'medical_history', 'symptoms'
    ]
    
    for field in safe_fields:
        if field in data and data[field]:
            value = str(data[field]).strip()
            # Remove potentially dangerous characters
            value = re.sub(r'[<>"\']', '', value)
            # Limit length
            value = value[:500] if field in ['medical_history', 'symptoms'] else value[:100]
            sanitized[field] = value
    
    return sanitized

def format_processing_time(seconds: float) -> str:
    """Format processing time in human-readable format"""
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.2f}s"
    else:
        minutes = int(seconds // 60)
        seconds = seconds % 60
        return f"{minutes}m {seconds:.1f}s"

def get_file_info(file_path: str) -> dict:
    """Get comprehensive file information"""
    try:
        stat = os.stat(file_path)
        
        info = {
            "filename": os.path.basename(file_path),
            "size_bytes": stat.st_size,
            "size_mb": round(stat.st_size / 1024 / 1024, 2),
            "modified_time": stat.st_mtime,
            "mime_type": mimetypes.guess_type(file_path)[0]
        }
        
        # Add image-specific info if it's an image
        if info["mime_type"] and info["mime_type"].startswith('image/'):
            try:
                with Image.open(file_path) as img:
                    info.update({
                        "width": img.width,
                        "height": img.height,
                        "format": img.format,
                        "mode": img.mode
                    })
            except:
                pass
        
        return info
        
    except Exception as e:
        logger.error(f"❌ Error getting file info: {e}")
        return {}

def create_thumbnail(image_path: str, output_path: str, size: Tuple[int, int] = (150, 150)) -> bool:
    """Create thumbnail of image"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Create thumbnail
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Save thumbnail
            img.save(output_path, 'JPEG', quality=85, optimize=True)
            
        return True
        
    except Exception as e:
        logger.error(f"❌ Error creating thumbnail: {e}")
        return False

class FileManager:
    """File management utilities"""
    
    @staticmethod
    def ensure_directory(directory: str) -> bool:
        """Ensure directory exists"""
        try:
            os.makedirs(directory, exist_ok=True)
            return True
        except Exception as e:
            logger.error(f"❌ Error creating directory {directory}: {e}")
            return False
    
    @staticmethod
    def clean_old_files(directory: str, max_age_hours: int = 24) -> int:
        """Clean old files from directory"""
        try:
            import time
            current_time = time.time()
            cutoff_time = current_time - (max_age_hours * 3600)
            
            cleaned_count = 0
            
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                if os.path.isfile(file_path):
                    file_mtime = os.path.getmtime(file_path)
                    if file_mtime < cutoff_time:
                        os.remove(file_path)
                        cleaned_count += 1
            
            return cleaned_count
            
        except Exception as e:
            logger.error(f"❌ Error cleaning old files: {e}")
            return 0
    
    @staticmethod
    def get_directory_size(directory: str) -> int:
        """Get total size of directory in bytes"""
        try:
            total_size = 0
            for dirpath, dirnames, filenames in os.walk(directory):
                for filename in filenames:
                    file_path = os.path.join(dirpath, filename)
                    if os.path.exists(file_path):
                        total_size += os.path.getsize(file_path)
            return total_size
        except Exception as e:
            logger.error(f"❌ Error calculating directory size: {e}")
            return 0

def validate_api_request(request_data: dict) -> Tuple[bool, str]:
    """Validate API request data"""
    required_fields = ['file']
    
    for field in required_fields:
        if field not in request_data:
            return False, f"Missing required field: {field}"
    
    # Additional validation can be added here
    return True, "Request is valid"

def log_analysis_event(event_type: str, request_id: str, details: dict = None):
    """Log analysis events for monitoring"""
    log_entry = {
        "timestamp": str(datetime.now()),
        "event_type": event_type,
        "request_id": request_id,
        "details": details or {}
    }
    
    logger.info(f"📊 Analysis Event: {event_type} [ID: {request_id[:8]}]")
