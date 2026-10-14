import React from 'react';

interface ProgressBarProps {
  progress: number;
  label?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  showPercentage?: boolean;
}

export default function ProgressBar({ 
  progress, 
  label, 
  color = 'blue',
  showPercentage = true 
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500'
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{clampedProgress.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
