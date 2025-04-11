'use client';
import { FC } from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

// Define the ReplyData type here to avoid dependency issues
interface ReplyData {
  name: string;
  value: number;
  color: string;
}

interface RepliesChartProps {
  data?: ReplyData[];
}

// Mock data to match the image
const mockData: ReplyData[] = [
  { name: 'Segment A', value: 40, color: '#000000' },
  { name: 'Segment B', value: 15, color: '#666666' },
  { name: 'Segment C', value: 35, color: '#999999' },
  { name: 'Segment D', value: 10, color: '#cccccc' }
];

const RepliesChart: FC<RepliesChartProps> = ({ data = [] }) => {
  // Use provided data or fallback to mock data if empty
  const chartData = data.length > 0 ? data : mockData;

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Replies</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex items-center justify-center h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">Total Value</div>
          <div className="font-semibold">$1,896.6</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 text-xs mb-1">Average</div>
          <div className="font-semibold">$1,276.3</div>
          <div className="text-green-500 text-xs">↑ 2%</div>
        </div>
      </div>
    </div>
  );
};

export default RepliesChart;