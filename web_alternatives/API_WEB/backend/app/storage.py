"""
Storage Manager for AI Oral Cancer Detection API
Handles file management, cleanup, and storage operations
"""

import os
import asyncio
import aiofiles
import shutil
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List
import glob

logger = logging.getLogger(__name__)

class StorageManager:
    """Production-ready storage management"""
    
    def __init__(self):
        self.upload_dir = "static/uploads"
        self.results_dir = "static/results"
        self.cleanup_interval = 24  # hours
        self.max_file_age = 48      # hours
        
        # Ensure directories exist
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.results_dir, exist_ok=True)
    
    async def cleanup_temp_file(self, file_path: str):
        """Clean up temporary file"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"🧹 Cleaned up temp file: {file_path}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to cleanup {file_path}: {e}")
    
    async def cleanup_old_files(self):
        """Clean up old files based on age"""
        try:
            current_time = datetime.now()
            cutoff_time = current_time - timedelta(hours=self.max_file_age)
            
            # Patterns to clean
            patterns = [
                os.path.join(self.upload_dir, "*"),
                os.path.join(self.results_dir, "*")
            ]
            
            cleaned_count = 0
            
            for pattern in patterns:
                files = glob.glob(pattern)
                for file_path in files:
                    try:
                        file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                        if file_mtime < cutoff_time:
                            os.remove(file_path)
                            cleaned_count += 1
                            logger.info(f"🧹 Cleaned old file: {file_path}")
                    except Exception as e:
                        logger.warning(f"⚠️ Failed to clean {file_path}: {e}")
            
            logger.info(f"✅ Cleanup completed: {cleaned_count} files removed")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
    
    async def start_cleanup_scheduler(self):
        """Start automatic cleanup scheduler"""
        logger.info("🔄 Starting automatic cleanup scheduler...")
        
        while True:
            try:
                await asyncio.sleep(self.cleanup_interval * 3600)  # Convert hours to seconds
                await self.cleanup_old_files()
            except Exception as e:
                logger.error(f"❌ Cleanup scheduler error: {e}")
                await asyncio.sleep(600)  # Wait 10 minutes before retry
    
    def get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        try:
            return os.path.getsize(file_path)
        except:
            return 0
    
    def get_storage_stats(self) -> dict:
        """Get storage statistics"""
        try:
            upload_files = glob.glob(os.path.join(self.upload_dir, "*"))
            result_files = glob.glob(os.path.join(self.results_dir, "*"))
            
            upload_size = sum(self.get_file_size(f) for f in upload_files)
            result_size = sum(self.get_file_size(f) for f in result_files)
            
            return {
                "upload_files": len(upload_files),
                "result_files": len(result_files),
                "upload_size_mb": round(upload_size / 1024 / 1024, 2),
                "result_size_mb": round(result_size / 1024 / 1024, 2),
                "total_size_mb": round((upload_size + result_size) / 1024 / 1024, 2)
            }
        except Exception as e:
            logger.error(f"❌ Failed to get storage stats: {e}")
            return {}
