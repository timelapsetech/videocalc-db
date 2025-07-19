import React from 'react';
import { ChartProps } from '../../types/stats';
import LoadingSpinner from '../LoadingSpinner';

interface ChartContainerProps extends Omit<ChartProps, 'data'> {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  children,
  loading,
  error,
  height = 300,
  className = '',
  theme = 'dark'
}) => {
  const containerClasses = `
    bg-dark-secondary rounded-lg p-6 border border-gray-800
    ${className}
  `.trim();

  if (loading) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center" style={{ height }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center text-red-400" style={{ height }}>
          <div className="text-center">
            <p className="text-sm mb-2">Failed to load chart data</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;