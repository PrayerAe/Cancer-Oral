"""
Custom Middleware for AI Oral Cancer Detection API
Handles logging, monitoring, and request processing
"""

import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for comprehensive request logging"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID
        request_id = str(uuid.uuid4())
        
        # Start timing
        start_time = time.time()
        
        # Log incoming request
        logger.info(
            f"📡 Incoming request: {request.method} {request.url.path} "
            f"[ID: {request_id[:8]}] from {request.client.host if request.client else 'unknown'}"
        )
        
        # Add request ID to state
        request.state.request_id = request_id
        
        try:
            # Process request
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            logger.info(
                f"✅ Request completed: {response.status_code} "
                f"[ID: {request_id[:8]}] in {process_time:.3f}s"
            )
            
            # Add headers
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = str(round(process_time, 3))
            
            return response
            
        except Exception as e:
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log error
            logger.error(
                f"❌ Request failed: {str(e)} "
                f"[ID: {request_id[:8]}] in {process_time:.3f}s"
            )
            
            raise

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting"""
    
    def __init__(self, app, calls: int = 60, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Simple rate limiting implementation
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Clean old entries
        self.clients = {
            ip: timestamps for ip, timestamps in self.clients.items()
            if any(ts > current_time - self.period for ts in timestamps)
        }
        
        # Check rate limit
        if client_ip in self.clients:
            # Filter recent calls
            recent_calls = [
                ts for ts in self.clients[client_ip] 
                if ts > current_time - self.period
            ]
            
            if len(recent_calls) >= self.calls:
                logger.warning(f"⚠️ Rate limit exceeded for {client_ip}")
                from fastapi import HTTPException
                raise HTTPException(status_code=429, detail="Rate limit exceeded")
            
            self.clients[client_ip] = recent_calls + [current_time]
        else:
            self.clients[client_ip] = [current_time]
        
        return await call_next(request)
