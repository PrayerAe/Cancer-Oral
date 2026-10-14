"""
Monitoring and Health Check System
Production monitoring for AI Oral Cancer Detection API
"""

import psutil
import time
import asyncio
import logging
from typing import Dict, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SystemMonitor:
    """System monitoring and health checks"""
    
    def __init__(self):
        self.start_time = datetime.now()
        self.request_count = 0
        self.successful_predictions = 0
        self.failed_predictions = 0
        self.total_processing_time = 0.0
    
    def record_request(self):
        """Record incoming request"""
        self.request_count += 1
    
    def record_prediction_success(self, processing_time: float):
        """Record successful prediction"""
        self.successful_predictions += 1
        self.total_processing_time += processing_time
    
    def record_prediction_failure(self):
        """Record failed prediction"""
        self.failed_predictions += 1
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get comprehensive system metrics"""
        try:
            # CPU and Memory metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Application metrics
            uptime = datetime.now() - self.start_time
            avg_processing_time = (
                self.total_processing_time / max(self.successful_predictions, 1)
            )
            success_rate = (
                self.successful_predictions / max(self.request_count, 1) * 100
            )
            
            return {
                "system": {
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "memory_used_gb": round(memory.used / 1024**3, 2),
                    "memory_total_gb": round(memory.total / 1024**3, 2),
                    "disk_percent": disk.percent,
                    "disk_used_gb": round(disk.used / 1024**3, 2),
                    "disk_total_gb": round(disk.total / 1024**3, 2)
                },
                "application": {
                    "uptime_seconds": uptime.total_seconds(),
                    "uptime_human": str(uptime),
                    "total_requests": self.request_count,
                    "successful_predictions": self.successful_predictions,
                    "failed_predictions": self.failed_predictions,
                    "success_rate_percent": round(success_rate, 2),
                    "avg_processing_time_seconds": round(avg_processing_time, 3)
                },
                "health": {
                    "status": "healthy" if cpu_percent < 80 and memory.percent < 80 else "degraded",
                    "timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting system metrics: {e}")
            return {
                "system": {},
                "application": {},
                "health": {
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.now().isoformat()
                }
            }
    
    def get_health_status(self) -> Dict[str, Any]:
        """Get simple health status"""
        metrics = self.get_system_metrics()
        
        health_checks = {
            "api": True,  # If we can respond, API is healthy
            "cpu": metrics["system"].get("cpu_percent", 100) < 90,
            "memory": metrics["system"].get("memory_percent", 100) < 90,
            "disk": metrics["system"].get("disk_percent", 100) < 95,
        }
        
        overall_health = all(health_checks.values())
        
        return {
            "status": "healthy" if overall_health else "degraded",
            "checks": health_checks,
            "timestamp": datetime.now().isoformat(),
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds()
        }

# Global monitor instance
system_monitor = SystemMonitor()
