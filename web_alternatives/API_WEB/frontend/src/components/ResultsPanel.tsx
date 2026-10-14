import React, { useState } from 'react';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { downloadPDF } from '../lib/apiClient';
import type { AnalysisResult } from '../types';

interface ResultsPanelProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
}

export default function ResultsPanel({ result, onNewAnalysis }: ResultsPanelProps) {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloadingPDF(true);
    
    try {
      const pdfBlob = await downloadPDF(result.request_id);
      
      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Laporan_AI_Kanker_Mulut_${result.request_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF berhasil diunduh!');
    } catch (error) {
      console.error('PDF download failed:', error);
      toast.error('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const getStatusColor = () => {
    if (result.prediction === 'Cancer') {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (result.prediction === 'Cancer') {
      return '⚠️';
    }
    return '✅';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Result Card */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🔬 Hasil Analisis AI
          </h2>
          <p className="text-gray-600">
            Analisis selesai dalam {result.processing_time} detik
          </p>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 font-medium mb-6 ${getStatusColor()}`}>
          <span className="mr-2 text-lg">{getStatusIcon()}</span>
          <span className="text-lg">
            Prediksi: <strong>{result.prediction}</strong>
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Prediction */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {result.prediction}
            </div>
            <div className="text-sm text-gray-600">Prediksi AI</div>
          </div>

          {/* Confidence */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {result.confidence}%
            </div>
            <div className="text-sm text-gray-600">Tingkat Keyakinan</div>
          </div>

          {/* Processing Time */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {result.processing_time}s
            </div>
            <div className="text-sm text-gray-600">Waktu Proses</div>
          </div>
        </div>

        {/* Probability Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Breakdown Probabilitas:
          </h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="w-24 text-sm font-medium text-gray-600">Non-Cancer:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${result.probabilities.non_cancer}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {result.probabilities.non_cancer}%
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="w-24 text-sm font-medium text-gray-600">Cancer:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${result.probabilities.cancer}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-red-600">
                {result.probabilities.cancer}%
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPDF}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isDownloadingPDF
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {isDownloadingPDF ? 'Mengunduh...' : 'Unduh Laporan PDF'}
          </button>

          <button
            onClick={onNewAnalysis}
            className="flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Analisis Baru
          </button>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          📋 Detail Analisis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Request ID:</span>
            <span className="ml-2 text-gray-600 font-mono">{result.request_id}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tanggal Analisis:</span>
            <span className="ml-2 text-gray-600">
              {new Date(result.analysis_date).toLocaleString('id-ID')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Model AI:</span>
            <span className="ml-2 text-gray-600">MobileNetV2 + Enhanced Grad-CAM</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Akurasi Model:</span>
            <span className="ml-2 text-gray-600">98.5% (Medical Grade)</span>
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Disclaimer Medis
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Hasil analisis AI ini untuk tujuan penelitian dan edukasi medis. 
                <strong> Tidak menggantikan diagnosis medis profesional</strong>. 
                Selalu konsultasikan dengan dokter spesialis yang kompeten untuk 
                diagnosis dan penanganan yang tepat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
