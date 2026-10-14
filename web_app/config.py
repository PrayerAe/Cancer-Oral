import os
from datetime import timedelta

class Config:
    """Enhanced application configuration"""
    
    # Basic Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Application Info
    APP_NAME = 'AI Oral Cancer Detection'
    APP_VERSION = '2.0.0'
    APP_DESCRIPTION = 'Advanced machine learning system for oral cancer detection'
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Model Configuration
    MODEL_PATH = 'models/MobilenetV2_best_model_20250716.pth'
    MODEL_DEVICE = 'cuda'  # or 'cpu'
    MODEL_INPUT_SIZE = (224, 224)
    MODEL_CLASSES = ['Non-Cancer', 'Cancer']
    
    # Database Configuration (if needed in future)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    SESSION_TYPE = 'filesystem'
    
    # Security Configuration
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # Performance Configuration
    SEND_FILE_MAX_AGE_DEFAULT = timedelta(hours=1)
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:5000', 'http://127.0.0.1:5000']
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        
        # Create necessary directories
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs('models', exist_ok=True)
        os.makedirs('logs', exist_ok=True)
        
        # Set up logging
        import logging
        from logging.handlers import RotatingFileHandler
        
        if not app.debug:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            
            file_handler = RotatingFileHandler(
                'logs/oral_cancer_ai.log', 
                maxBytes=10240000, 
                backupCount=10
            )
            file_handler.setFormatter(logging.Formatter(Config.LOG_FORMAT))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
            
            app.logger.setLevel(logging.INFO)
            app.logger.info('AI Oral Cancer Detection startup')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Enhanced security for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    WTF_CSRF_ENABLED = False

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
