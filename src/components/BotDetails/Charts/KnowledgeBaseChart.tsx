'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KnowledgeBaseChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Simple seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const KnowledgeBaseChart: React.FC<KnowledgeBaseChartProps> = ({ timeRange }) => {
  // Generate consistent random data based on time range
  const data = useMemo(() => {
    const categories = ['Product Info', 'Troubleshooting', 'Pricing', 'Returns', 'Shipping'];
    
    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const seed = seedMap[timeRange] || 1;
    
    // Adjust data based on time range
    const multiplier = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : 12;
    
    return categories.map((category, index) => {
      // Use seeded random for consistent "randomness"
      const randomFn = (offset: number) => {
        const randomValue = seededRandom(seed + index + offset);
        return Math.floor(randomValue * 50) + 30;
      };
      
      const kbUsage = randomFn(0) * multiplier;
      const defaultUsage = randomFn(100) * multiplier;
      
      return {
        name: category,
        'Knowledge Base': kbUsage,
        'Default Responses': defaultUsage,
      };
    });
  }, [timeRange]);

  // Calculate total knowledge base usage percentage
  const kbUtilizationPercentage = useMemo(() => {
    const totalKbUsage = data.reduce((sum, item) => sum + item['Knowledge Base'], 0);
    const totalDefaultUsage = data.reduce((sum, item) => sum + item['Default Responses'], 0);
    const totalUsage = totalKbUsage + totalDefaultUsage;
    
    return Math.round((totalKbUsage / totalUsage) * 100);
  }, [data]);

  return (
    <div className="h-72 mb-4 mt-2">
      <div className="mb-4 text-center bg-blue-50 p-2 rounded-lg inline-block">
        <span className="text-sm text-gray-600">Knowledge Base Utilization:</span>
        <span className="ml-2 font-bold text-blue-600">{kbUtilizationPercentage}%</span>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" axisLine={false} tickLine={false} />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            width={85}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Legend />
          <Bar dataKey="Knowledge Base" fill="#3B82F6" barSize={12} radius={[0, 4, 4, 0]} />
          <Bar dataKey="Default Responses" fill="#93C5FD" barSize={12} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KnowledgeBaseChart;