import { useState, useCallback } from 'react';
import { analyzeImage } from '../lib/apiClient';
import type { AnalysisResult, PatientData } from '../types';

interface UseAnalysisReturn {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  analyze: (file: File, patientData: PatientData) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (file: File, patientData: PatientData) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeImage(file, patientData);
      setResult(analysisResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analisis gagal';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    result,
    isAnalyzing,
    error,
    analyze,
    reset
  };
}
