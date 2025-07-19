import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ResolutionStat, ChartProps } from '../../types/stats';
import ChartContainer from './ChartContainer';

interface ResolutionDistributionChartProps extends ChartProps {
  data: ResolutionStat[];
}

// Color palette for different resolutions
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
];

const ResolutionDistributionChart: React.FC<ResolutionDistributionChartProps> = ({
  data,
  loading,
  error,
  height = 300,
  responsive = true,
  theme = 'dark'
}) => {
  // Transform data for the chart
  const chartData = data.map((item, index) => ({
    name: item.resolution,
    value: item.count,
    percentage: item.percentage,
    averageBitrate: item.averageBitrate,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-primary border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium text-sm mb-1">{data.name}</p>
          <p className="text-blue-400 text-sm">
            Count: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-green-400 text-sm">
            Usage: <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-yellow-400 text-sm">
            Avg Bitrate: <span className="font-semibold">{data.averageBitrate.toFixed(1)} Mbps</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300 text-xs">
              {entry.value} ({chartData.find(d => d.name === entry.value)?.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer
      title="Resolution Distribution"
      loading={loading}
      error={error}
      height={height}
      theme={theme}
    >
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-sm">No resolution data available</p>
            <p className="text-xs mt-1">Start using the calculator to see statistics</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="#1F2937"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default ResolutionDistributionChart;