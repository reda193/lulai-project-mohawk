'use client';

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface EscalationRateChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Simple seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const EscalationRateChart: React.FC<EscalationRateChartProps> = ({ timeRange }) => {
  // Generate escalation data based on time range
  const data = useMemo(() => {
    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const seed = seedMap[timeRange] || 1;

    // Adjust data slightly based on time range to simulate different periods
    let escalationRate;
    
    switch (timeRange) {
      case '7d':
        escalationRate = 8 + seededRandom(seed) * 4;
        break;
      case '30d':
        escalationRate = 10 + seededRandom(seed + 100) * 5;
        break;
      case '90d':
        escalationRate = 12 + seededRandom(seed + 200) * 6;
        break;
      default:
        escalationRate = 10;
    }
    
    return [
      { name: 'Escalated', value: Math.round(escalationRate) },
      { name: 'Resolved by Bot', value: 100 - Math.round(escalationRate) },
    ];
  }, [timeRange]);

  const COLORS = ['#EF4444', '#10B981'];
  
  // Calculate some stats
  const totalInteractions = useMemo(() => {
    // Use seeded random for consistent "randomness"
    const seedMap = {
      '7d': 200,
      '30d': 800,
      '90d': 2400
    };
    const baseSeed = seedMap[timeRange] || 800;
    
    // Add some seeded "randomness"
    const seed = timeRange === '7d' ? 1 : timeRange === '30d' ? 2 : 3;
    return baseSeed + Math.floor(seededRandom(seed) * 500);
  }, [timeRange]);
  
  const escalationCount = Math.round((data[0].value / 100) * totalInteractions);

  return (
    <div className="h-72">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Escalation Rate</div>
          <div className="text-2xl font-bold text-red-500">{data[0].value}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Total Escalations</div>
          <div className="text-2xl font-bold">{escalationCount}</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, '']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center" 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EscalationRateChart;