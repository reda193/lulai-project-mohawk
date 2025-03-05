'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface UnrecognizedQueriesChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const UnrecognizedQueriesChart: React.FC<UnrecognizedQueriesChartProps> = ({ timeRange }) => {
  // Generate top unrecognized query types
  const data = useMemo(() => {
    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const baseSeed = seedMap[timeRange] || 1;

    const categories = [
      { name: 'Product Specs', baseValue: 35 },
      { name: 'Returns Policy', baseValue: 25 },
      { name: 'Shipping Options', baseValue: 20 },
      { name: 'Account Issues', baseValue: 15 },
      { name: 'Payment Methods', baseValue: 10 },
    ];
    
    // Randomize consistently based on seed and timeRange
    return categories.map((item, index) => {
      const seed = baseSeed + index;
      const variationFactor = seededRandom(seed);
      const timeRangeFactor = 
        timeRange === '7d' ? -5 : 
        timeRange === '90d' ? 5 : 
        0;
      
      return {
        name: item.name,
        value: Math.max(5, item.baseValue + timeRangeFactor + Math.floor(variationFactor * 10) - 5)
      };
    });
  }, [timeRange]);

  const COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'];
  
  // Calculate total unrecognized queries
  const totalQueries = useMemo(() => {
    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const seed = seedMap[timeRange] || 1;

    // Generate a number based on time range
    const baseCount = timeRange === '7d' ? 20 : timeRange === '30d' ? 85 : 220;
    return baseCount + Math.floor(seededRandom(seed) * (baseCount / 2));
  }, [timeRange]);

  return (
    <div className="h-72">
      <div className="mb-3 text-center">
        <div className="text-sm text-gray-500">Total Unrecognized Queries</div>
        <div className="text-2xl font-bold">{totalQueries}</div>
      </div>
      
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, 'Queries']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UnrecognizedQueriesChart;