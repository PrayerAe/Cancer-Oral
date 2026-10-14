"""
AI Oral Cancer Detection API - Backend Service
Production-ready FastAPI implementation with medical-grade security and performance
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import os
import uuid
import pickle
import tempfile
import asyncio
from datetime import datetime, timedelta
from pathlib import Path
import logging
from typing import Optional, Dict, Any
import aiofiles

# Import internal modules
from .inference import AIInferenceEngine
from .gradcam import GradCAMVisualizer
from .pdf.generator import PDFReportGenerator
from .storage import StorageManager
from .config import Settings
from .security import SecurityManager
from .schemas import PredictionResponse, AnalysisRequest

# Initialize settings and logging
settings = Settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-oral-cancer-api")

# Initialize FastAPI app
app = FastAPI(
    title="AI Oral Cancer Detection API",
    description="Production-grade AI API for oral cancer detection with Grad-CAM visualization",
    version="2.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

# Initialize core components
inference_engine = AIInferenceEngine()
gradcam_visualizer = GradCAMVisualizer()
pdf_generator = PDFReportGenerator()
storage_manager = StorageManager()
security_manager = SecurityManager()

# Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize AI components on startup"""
    logger.info("🚀 Starting AI Oral Cancer Detection API...")
    
    # Initialize AI engine
    await inference_engine.initialize()
    
    # Create necessary directories
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.RESULTS_DIR, exist_ok=True)
    
    # Start cleanup scheduler
    asyncio.create_task(storage_manager.start_cleanup_scheduler())
    
    logger.info("✅ API initialization completed")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "AI Oral Cancer Detection API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": inference_engine.is_loaded(),
        "uptime_seconds": (datetime.now() - inference_engine.start_time).total_seconds()
    }

# Main prediction endpoint
@app.post("/predict", response_model=PredictionResponse)
async def predict_cancer(
    file: UploadFile = File(..., description="Medical image file"),
    patient_name: Optional[str] = Form(None),
    patient_age: Optional[str] = Form(None),
    patient_gender: Optional[str] = Form(None),
    doctor_name: Optional[str] = Form(None),
    hospital: Optional[str] = Form(None),
    medical_history: Optional[str] = Form(None),
    symptoms: Optional[str] = Form(None),
    api_key: str = Depends(security_manager.verify_api_key)
):
    """
    Main AI prediction endpoint
    
    Processes medical images for oral cancer detection using:
    - MobileNetV2 neural network
    - Enhanced Grad-CAM visualization
    - Medical-grade analysis pipeline
    """
    
    request_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    logger.info(f"🔄 Processing prediction request {request_id}")
    
    try:
        # Validate file
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File size exceeds maximum limit")
        
        # Save uploaded file temporarily
        file_extension = Path(file.filename).suffix.lower()
        temp_file_path = os.path.join(settings.UPLOAD_DIR, f"{request_id}_input{file_extension}")
        
        async with aiofiles.open(temp_file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Perform AI inference
        inference_result = await inference_engine.predict(temp_file_path)
        
        # Generate Grad-CAM visualizations
        gradcam_result = await gradcam_visualizer.generate_visualization(
            temp_file_path, 
            inference_result['model_output']
        )
        
        # Save results and artifacts
        analysis_data = {
            "request_id": request_id,
            "prediction": inference_result['prediction'],
            "confidence": inference_result['confidence'],
            "probabilities": inference_result['probabilities'],
            "analysis_date": start_time.isoformat(),
            "processing_time": (datetime.now() - start_time).total_seconds(),
            "patient_data": {
                "name": patient_name,
                "age": patient_age,
                "gender": patient_gender,
                "doctor_name": doctor_name,
                "hospital": hospital,
                "medical_history": medical_history,
                "symptoms": symptoms
            },
            "artifacts": {
                "original_image": temp_file_path,
                "heatmap_image": gradcam_result['heatmap_path'],
                "overlay_image": gradcam_result['overlay_path']
            }
        }
        
        # Save analysis result
        result_path = os.path.join(settings.RESULTS_DIR, f"result_{request_id}.pkl")
        async with aiofiles.open(result_path, 'wb') as f:
            await f.write(pickle.dumps(analysis_data))
        
        # Clean up temporary files (keep only results)
        await storage_manager.cleanup_temp_file(temp_file_path)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"✅ Prediction completed for {request_id} in {processing_time:.2f}s")
        
        # Return compact response
        return PredictionResponse(
            success=True,
            request_id=request_id,
            prediction=inference_result['prediction'],
            confidence=round(inference_result['confidence'], 2),
            probabilities={
                "non_cancer": round(inference_result['probabilities']['non_cancer'], 2),
                "cancer": round(inference_result['probabilities']['cancer'], 2)
            },
            processing_time=round(processing_time, 2),
            analysis_date=start_time.isoformat()
        )
        
    except Exception as e:
        logger.error(f"❌ Prediction failed for {request_id}: {str(e)}")
        
        # Clean up on error
        if 'temp_file_path' in locals():
            await storage_manager.cleanup_temp_file(temp_file_path)
        
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

# PDF download endpoint
@app.get("/download_pdf/{request_id}")
async def download_pdf(
    request_id: str,
    api_key: str = Depends(security_manager.verify_api_key)
):
    """Download PDF report for analysis results"""
    
    try:
        # Load analysis result
        result_path = os.path.join(settings.RESULTS_DIR, f"result_{request_id}.pkl")
        
        if not os.path.exists(result_path):
            raise HTTPException(status_code=404, detail="Analysis result not found")
        
        async with aiofiles.open(result_path, 'rb') as f:
            content = await f.read()
            analysis_data = pickle.loads(content)
        
        # Generate PDF report
        pdf_path = await pdf_generator.generate_report(analysis_data, request_id)
        
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF generation failed")
        
        # Return PDF file
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"Laporan_AI_Kanker_Mulut_{request_id}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ PDF download failed for {request_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF download failed: {str(e)}")

# Get analysis result endpoint
@app.get("/result/{request_id}")
async def get_analysis_result(
    request_id: str,
    api_key: str = Depends(security_manager.verify_api_key)
):
    """Get detailed analysis result by request ID"""
    
    try:
        result_path = os.path.join(settings.RESULTS_DIR, f"result_{request_id}.pkl")
        
        if not os.path.exists(result_path):
            raise HTTPException(status_code=404, detail="Analysis result not found")
        
        async with aiofiles.open(result_path, 'rb') as f:
            content = await f.read()
            analysis_data = pickle.loads(content)
        
        # Return detailed results (without binary data)
        return {
            "request_id": analysis_data["request_id"],
            "prediction": analysis_data["prediction"],
            "confidence": analysis_data["confidence"],
            "probabilities": analysis_data["probabilities"],
            "analysis_date": analysis_data["analysis_date"],
            "processing_time": analysis_data["processing_time"],
            "patient_data": analysis_data["patient_data"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get result failed for {request_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Get result failed: {str(e)}")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Resource not found", "detail": str(exc)}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": "An unexpected error occurred"}
    )

# Run server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000)),
        reload=settings.DEBUG,
        workers=1  # Single worker for ML model consistency
    )
