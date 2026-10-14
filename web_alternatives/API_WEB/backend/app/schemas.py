from pydantic import BaseModel

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float

class AnalysisRequest(BaseModel):
    image: str  # Path atau base64
