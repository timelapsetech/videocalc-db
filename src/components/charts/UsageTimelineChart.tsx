import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TemporalStat, ChartProps, TimeRange } from '../../types/stats';
import ChartContainer from './ChartContainer';

interface UsageTimelineChartProps extends ChartProps {
  data: TemporalStat[];
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

const UsageTimelineChart: React.FC<UsageTimelineChartProps> = ({
  data,
  loading,
  error,
  height = 300,
  responsive = true,
  theme = 'dark',
  timeRange = '30d',
  onTimeRangeChange
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'count' | 'uniqueCodecs'>('count');

  // Transform data for the chart
  const chartData = data.map(item => ({
    date: item.date,
    displayDate: formatDate(item.date),
    count: item.count,
    uniqueCodecs: item.uniqueCodecs,
    formattedDate: formatDateForTooltip(item.date)
  }));

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatDateForTooltip(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-primary border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium text-sm mb-2">{data.formattedDate}</p>
          <p className="text-blue-400 text-sm">
            Calculations: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-green-400 text-sm">
            Unique Codecs: <span className="font-semibold">{data.uniqueCodecs}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { value: '7d' as TimeRange, label: '7 Days' },
    { value: '30d' as TimeRange, label: '30 Days' },
    { value: '90d' as TimeRange, label: '90 Days' },
    { value: 'all' as TimeRange, label: 'All Time' }
  ];

  const metricOptions = [
    { value: 'count' as const, label: 'Total Calculations', color: '#3B82F6' },
    { value: 'uniqueCodecs' as const, label: 'Unique Codecs', color: '#10B981' }
  ];

  return (
    <ChartContainer
      title="Usage Timeline"
      loading={loading}
      error={error}
      height={height}
      theme={theme}
    >
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-sm">No timeline data available</p>
            <p className="text-xs mt-1">Start using the calculator to see trends</p>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 mb-4 justify-between items-center">
            <div className="flex gap-2">
              {metricOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedMetric(option.value)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedMetric === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            {onTimeRangeChange && (
              <div className="flex gap-1">
                {timeRangeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => onTimeRangeChange(option.value)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      timeRange === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 20,
                  bottom: 20
                }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={metricOptions.find(m => m.value === selectedMetric)?.color} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={metricOptions.find(m => m.value === selectedMetric)?.color} 
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  tickLine={{ stroke: '#6B7280' }}
                  label={{ 
                    value: metricOptions.find(m => m.value === selectedMetric)?.label, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: '12px' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={metricOptions.find(m => m.value === selectedMetric)?.color}
                  strokeWidth={2}
                  fill="url(#colorGradient)"
                  dot={{ 
                    fill: metricOptions.find(m => m.value === selectedMetric)?.color, 
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: metricOptions.find(m => m.value === selectedMetric)?.color,
                    strokeWidth: 2,
                    fill: '#1F2937'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </ChartContainer>
  );
};

export default UsageTimelineChart;