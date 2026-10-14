"""
Configuration settings for AI Oral Cancer Detection API
"""

import os
from typing import List

class Settings:
    """Application settings"""
    
    # Basic settings
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    API_VERSION: str = "2.0.0"
    
    # Security settings
    API_KEY: str = os.getenv("API_KEY", "dev-api-key-12345")
    ALLOWED_ORIGINS: List[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://your-frontend.vercel.app").split(",")
    ALLOWED_HOSTS: List[str] = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1,your-backend.railway.app").split(",")
    
    # File settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "static/uploads")
    RESULTS_DIR: str = os.getenv("RESULTS_DIR", "static/results")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", "16777216"))  # 16MB
    
    # Model settings
    MODEL_URL: str = os.getenv("MODEL_URL", "")
    DEVICE: str = os.getenv("DEVICE", "cpu")
    
    # Cleanup settings
    CLEANUP_INTERVAL_HOURS: int = int(os.getenv("CLEANUP_INTERVAL_HOURS", "24"))
    MAX_FILE_AGE_HOURS: int = int(os.getenv("MAX_FILE_AGE_HOURS", "48"))
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
