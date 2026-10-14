"""
Security Manager for AI Oral Cancer Detection API
Handles authentication, rate limiting, and security measures
"""

import time
import hashlib
import logging
from typing import Dict, Optional
from collections import defaultdict, deque
from fastapi import HTTPException, Header, Request
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SecurityManager:
    """Production-ready security management"""
    
    def __init__(self):
        self.api_keys = {
            "dev-api-key-12345": {"name": "development", "permissions": ["read", "write"]},
            # Add more API keys as needed
        }
        
        # Rate limiting storage
        self.rate_limit_storage: Dict[str, deque] = defaultdict(deque)
        self.rate_limit_window = 60  # seconds
        self.rate_limit_max_requests = 30
        
        # Blocked IPs
        self.blocked_ips = set()
    
    async def verify_api_key(self, x_api_key: str = Header(..., alias="X-API-Key")) -> str:
        """Verify API key authentication"""
        if not x_api_key:
            raise HTTPException(
                status_code=401,
                detail="API key is required"
            )
        
        if x_api_key not in self.api_keys:
            logger.warning(f"⚠️ Invalid API key attempt: {x_api_key[:10]}...")
            raise HTTPException(
                status_code=401,
                detail="Invalid API key"
            )
        
        return x_api_key
    
    def get_client_ip(self, request: Request) -> str:
        """Get client IP address"""
        # Check for forwarded headers first
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def check_rate_limit(self, request: Request) -> bool:
        """Check rate limiting for requests"""
        client_ip = self.get_client_ip(request)
        
        # Check if IP is blocked
        if client_ip in self.blocked_ips:
            raise HTTPException(
                status_code=429,
                detail="IP address is blocked due to abuse"
            )
        
        current_time = time.time()
        window_start = current_time - self.rate_limit_window
        
        # Get request history for this IP
        request_times = self.rate_limit_storage[client_ip]
        
        # Remove old requests outside the window
        while request_times and request_times[0] < window_start:
            request_times.popleft()
        
        # Check if rate limit is exceeded
        if len(request_times) >= self.rate_limit_max_requests:
            logger.warning(f"⚠️ Rate limit exceeded for IP: {client_ip}")
            
            # Temporary block for repeated violations
            if len(request_times) > self.rate_limit_max_requests * 2:
                self.blocked_ips.add(client_ip)
                logger.warning(f"🚫 IP blocked for abuse: {client_ip}")
            
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {self.rate_limit_max_requests} requests per minute."
            )
        
        # Add current request
        request_times.append(current_time)
        
        return True
    
    def validate_file_upload(self, file_content: bytes, filename: str) -> bool:
        """Validate uploaded file for security"""
        # Check file size
        max_size = 16 * 1024 * 1024  # 16MB
        if len(file_content) > max_size:
            raise HTTPException(
                status_code=400,
                detail="File size exceeds maximum limit"
            )
        
        # Check file signature (magic bytes)
        image_signatures = [
            b'\xff\xd8\xff',  # JPEG
            b'\x89\x50\x4e\x47',  # PNG
            b'\x47\x49\x46\x38',  # GIF
            b'\x42\x4d',  # BMP
        ]
        
        if not any(file_content.startswith(sig) for sig in image_signatures):
            raise HTTPException(
                status_code=400,
                detail="Invalid image file format"
            )
        
        # Check filename for suspicious patterns
        dangerous_extensions = ['.exe', '.bat', '.cmd', '.sh', '.py', '.js']
        if any(filename.lower().endswith(ext) for ext in dangerous_extensions):
            raise HTTPException(
                status_code=400,
                detail="Dangerous file type detected"
            )
        
        return True
    
    def sanitize_filename(self, filename: str) -> str:
        """Sanitize filename for security"""
        # Remove path traversal attempts
        filename = filename.replace("../", "").replace("..\\", "")
        
        # Remove dangerous characters
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*', '\0']
        for char in dangerous_chars:
            filename = filename.replace(char, "_")
        
        # Limit filename length
        if len(filename) > 255:
            name, ext = os.path.splitext(filename)
            filename = name[:250] + ext
        
        return filename
