import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CodecStat, ChartProps } from '../../types/stats';
import ChartContainer from './ChartContainer';

interface PopularCodecsChartProps extends ChartProps {
  data: CodecStat[];
}

const PopularCodecsChart: React.FC<PopularCodecsChartProps> = ({
  data,
  loading,
  error,
  height = 300,
  responsive = true,
  theme = 'dark'
}) => {
  // Transform data for the chart
  const chartData = data.map(item => ({
    name: `${item.codecName} (${item.variantName})`,
    count: item.count,
    percentage: item.percentage,
    fullName: `${item.codecCategory} - ${item.codecName} - ${item.variantName}`
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-primary border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium text-sm mb-1">{data.fullName}</p>
          <p className="text-blue-400 text-sm">
            Count: <span className="font-semibold">{data.count}</span>
          </p>
          <p className="text-green-400 text-sm">
            Usage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxisLabel = (value: string) => {
    // Truncate long labels for better display
    return value.length > 20 ? value.substring(0, 17) + '...' : value;
  };

  return (
    <ChartContainer
      title="Most Popular Codecs"
      loading={loading}
      error={error}
      height={height}
      theme={theme}
    >
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-sm">No codec data available</p>
            <p className="text-xs mt-1">Start using the calculator to see statistics</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={formatXAxisLabel}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              label={{ 
                value: 'Usage Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#9CA3AF' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              stroke="#1E40AF"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default PopularCodecsChart;