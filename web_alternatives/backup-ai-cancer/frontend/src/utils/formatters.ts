/**
 * Utility functions for formatting data
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatProcessingTime(seconds: number): string {
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`;
  } else if (seconds < 60) {
    return `${seconds.toFixed(2)}s`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  }
}

export function formatConfidence(confidence: number): string {
  return `${confidence.toFixed(1)}%`;
}

export function formatRequestId(requestId: string): string {
  // Show only first 8 characters for display
  return requestId.substring(0, 8).toUpperCase();
}

export function getStatusColor(prediction: string): {
  bg: string;
  text: string;
  border: string;
} {
  if (prediction.toLowerCase() === 'cancer') {
    return {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200'
    };
  }
  
  return {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  };
}

export function getConfidenceLevel(confidence: number): {
  level: string;
  color: string;
  description: string;
} {
  if (confidence >= 90) {
    return {
      level: 'Sangat Tinggi',
      color: 'text-red-600',
      description: 'Model sangat yakin dengan prediksi ini'
    };
  } else if (confidence >= 75) {
    return {
      level: 'Tinggi',
      color: 'text-orange-600',
      description: 'Model cukup yakin dengan prediksi ini'
    };
  } else if (confidence >= 60) {
    return {
      level: 'Sedang',
      color: 'text-yellow-600',
      description: 'Model memiliki keyakinan sedang'
    };
  } else {
    return {
      level: 'Rendah',
      color: 'text-green-600',
      description: 'Model kurang yakin, butuh verifikasi'
    };
  }
}
