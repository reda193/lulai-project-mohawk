'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TrainingCoverageChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TrainingCoverageChart: React.FC<TrainingCoverageChartProps> = ({ timeRange }) => {
  // Generate coverage percentage based on time range
  const coveragePercentage = useMemo(() => {
    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const seed = seedMap[timeRange] || 1;

    // Coverage improves over time
    const basePercentage = timeRange === '7d' ? 65 : timeRange === '30d' ? 72 : 78;
    return Math.min(95, basePercentage + Math.floor(seededRandom(seed) * 10));
  }, [timeRange]);

  // Data for pie chart
  const data = [
    { name: 'Covered', value: coveragePercentage },
    { name: 'Uncovered', value: 100 - coveragePercentage },
  ];

  const COLORS = ['#8B5CF6', '#E9D5FF'];

  return (
    <div className="h-72 flex flex-col items-center justify-center">
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-3xl font-bold">{coveragePercentage}%</div>
          <div className="text-sm text-gray-500">Coverage</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
          <span className="text-gray-700">{coveragePercentage}% of queries covered by training</span>
        </div>
        <div className="text-sm mt-1">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-200 mr-2"></span>
          <span className="text-gray-700">{100 - coveragePercentage}% uncovered queries</span>
        </div>
      </div>
    </div>
  );
};

export default TrainingCoverageChart;