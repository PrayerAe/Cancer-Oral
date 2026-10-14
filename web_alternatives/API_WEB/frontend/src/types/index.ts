export interface PatientData {
  patient_name?: string;
  patient_age?: string;
  patient_gender?: string;
  doctor_name?: string;
  hospital?: string;
  medical_history?: string;
  symptoms?: string;
}

export interface AnalysisResult {
  success: boolean;
  request_id: string;
  prediction: 'Cancer' | 'Non-Cancer';
  confidence: number;
  probabilities: {
    non_cancer: number;
    cancer: number;
  };
  processing_time: number;
  analysis_date: string;
}

export interface APIError {
  error: string;
  detail: string;
  timestamp: string;
}
