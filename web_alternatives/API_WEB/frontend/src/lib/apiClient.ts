import axios from 'axios';
import type { AnalysisResult, PatientData } from '../types';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-12345';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI processing
  headers: {
    'X-API-Key': API_KEY,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Analyze medical image using AI API
 */
export async function analyzeImage(
  imageFile: File,
  patientData: PatientData
): Promise<AnalysisResult> {
  try {
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File harus berupa gambar');
    }

    if (imageFile.size > 16 * 1024 * 1024) { // 16MB
      throw new Error('Ukuran file terlalu besar (maksimal 16MB)');
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', imageFile);

    // Add patient data
    Object.entries(patientData).forEach(([key, value]) => {
      if (value && value.trim()) {
        formData.append(key, value.trim());
      }
    });

    // Make API request
    const response = await apiClient.post<AnalysisResult>('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;

  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || error.message;
      throw new Error(message);
    }
    
    throw error;
  }
}

/**
 * Download PDF report
 */
export async function downloadPDF(requestId: string): Promise<Blob> {
  try {
    const response = await apiClient.get(`/download_pdf/${requestId}`, {
      responseType: 'blob',
    });

    return response.data;

  } catch (error) {
    console.error('❌ PDF download failed:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 'PDF download failed';
      throw new Error(message);
    }
    
    throw error;
  }
}

/**
 * Get analysis result by request ID
 */
export async function getAnalysisResult(requestId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/result/${requestId}`);
    return response.data;

  } catch (error) {
    console.error('❌ Get analysis result failed:', error);
    
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.detail || 'Failed to get analysis result';
      throw new Error(message);
    }
    
    throw error;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<any> {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    throw error;
  }
}
