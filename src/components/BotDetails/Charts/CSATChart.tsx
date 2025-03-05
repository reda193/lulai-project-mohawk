'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface CSATChartProps {
  timeRange: '7d' | '30d' | '90d';
}

const CSATChart: React.FC<CSATChartProps> = ({ timeRange }) => {
  // Generate CSAT data
  const data = useMemo(() => {
    // Adjust data slightly based on time range to simulate different periods
    let verySatisfiedPercentage;
    let satisfiedPercentage;
    let neutralPercentage;
    let dissatisfiedPercentage;
    let veryDissatisfiedPercentage;
    
    switch (timeRange) {
      case '7d':
        verySatisfiedPercentage = 55 + Math.random() * 10;
        satisfiedPercentage = 30 + Math.random() * 10;
        neutralPercentage = 10 + Math.random() * 5;
        dissatisfiedPercentage = 3 + Math.random() * 3;
        veryDissatisfiedPercentage = 1 + Math.random() * 2;
        break;
      case '30d':
        verySatisfiedPercentage = 50 + Math.random() * 10;
        satisfiedPercentage = 32 + Math.random() * 8;
        neutralPercentage = 12 + Math.random() * 5;
        dissatisfiedPercentage = 4 + Math.random() * 3;
        veryDissatisfiedPercentage = 2 + Math.random() * 2;
        break;
      case '90d':
        verySatisfiedPercentage = 48 + Math.random() * 8;
        satisfiedPercentage = 30 + Math.random() * 10;
        neutralPercentage = 15 + Math.random() * 5;
        dissatisfiedPercentage = 5 + Math.random() * 3;
        veryDissatisfiedPercentage = 2 + Math.random() * 2;
        break;
      default:
        verySatisfiedPercentage = 50;
        satisfiedPercentage = 30;
        neutralPercentage = 15;
        dissatisfiedPercentage = 4;
        veryDissatisfiedPercentage = 1;
    }
    
    return [
      { name: 'Very Satisfied (5)', value: Math.round(verySatisfiedPercentage) },
      { name: 'Satisfied (4)', value: Math.round(satisfiedPercentage) },
      { name: 'Neutral (3)', value: Math.round(neutralPercentage) },
      { name: 'Dissatisfied (2)', value: Math.round(dissatisfiedPercentage) },
      { name: 'Very Dissatisfied (1)', value: Math.round(veryDissatisfiedPercentage) },
    ];
  }, [timeRange]);

  const COLORS = ['#22C55E', '#34D399', '#9CA3AF', '#FB923C', '#EF4444'];
  
  // Calculate average CSAT score
  const averageCsat = useMemo(() => {
    const totalWeight = data.reduce((acc, item, index) => {
      // Weight: 5 - Very Satisfied, 4 - Satisfied, etc.
      const weight = 5 - index;
      return acc + (item.value * weight);
    }, 0);
    
    const totalResponses = data.reduce((acc, item) => acc + item.value, 0);
    
    return (totalWeight / totalResponses).toFixed(1);
  }, [data]);

  return (
    <div className="h-72 flex flex-col">
      <div className="mb-2 flex justify-center">
        <div className="text-center px-5 py-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Average CSAT Score</div>
          <div className="text-3xl font-bold">{averageCsat}/5</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
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
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CSATChart;