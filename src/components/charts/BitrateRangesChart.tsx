import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BitrateStat, ChartProps } from '../../types/stats';
import ChartContainer from './ChartContainer';

interface BitrateRangesChartProps extends ChartProps {
  data: BitrateStat[];
}

// Color palette for bitrate ranges
const COLORS = [
  '#10B981', // Green for low bitrates
  '#3B82F6', // Blue for medium bitrates
  '#F59E0B', // Yellow for high bitrates
  '#EF4444', // Red for very high bitrates
  '#8B5CF6', // Purple for extreme bitrates
];

const BitrateRangesChart: React.FC<BitrateRangesChartProps> = ({
  data,
  loading,
  error,
  height = 300,
  responsive = true,
  theme = 'dark'
}) => {
  // Transform data for the chart
  const chartData = data.map((item, index) => ({
    name: item.range,
    value: item.count,
    percentage: item.percentage,
    minBitrate: item.minBitrate,
    maxBitrate: item.maxBitrate,
    color: COLORS[index % COLORS.length]
  }));

  const totalCalculations = chartData.reduce((sum, item) => sum + item.value, 0);

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
            Range: <span className="font-semibold">
              {data.minBitrate.toFixed(1)} - {data.maxBitrate.toFixed(1)} Mbps
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: any) => {
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
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };



  return (
    <ChartContainer
      title="Bitrate Distribution"
      loading={loading}
      error={error}
      height={height}
      theme={theme}
    >
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <p className="text-sm">No bitrate data available</p>
            <p className="text-xs mt-1">Start using the calculator to see statistics</p>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Chart */}
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={90}
                  innerRadius={50}
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
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalCalculations}</div>
                <div className="text-xs text-gray-400">Total Calculations</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {chartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300 text-xs">
                  {entry.name}
                </span>
                <span className="text-gray-400 text-xs">
                  ({entry.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartContainer>
  );
};

export default BitrateRangesChart;