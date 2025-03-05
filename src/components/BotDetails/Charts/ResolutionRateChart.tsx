'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the props interface
interface ResolutionRateChartProps {
  timeRange: '7d' | '30d' | '90d';
}

const ResolutionRateChart: React.FC<ResolutionRateChartProps> = ({ timeRange }) => {
  // Generate random data based on time range
  const data = useMemo(() => {
    let days;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    const today = new Date();
    const result = [];
    
    // Generate based on days, but if too many days, create weekly data points instead
    const interval = days > 30 ? 7 : 1;
    const labels = days > 30 ? 'weeks' : 'days';
    
    for (let i = 0; i < days; i += interval) {
      const date = new Date();
      date.setDate(today.getDate() - (days - i));
      
      // Base resolution rate between 70% and 95%
      const baseRate = 70 + Math.random() * 25;
      // Add a slight upward trend
      const trendFactor = (i / days) * 10;
      // Add some randomness
      const noise = (Math.random() - 0.5) * 5;
      
      const resolutionRate = Math.min(98, Math.max(65, baseRate + trendFactor + noise));
      
      result.push({
        date: labels === 'weeks'
          ? `Week ${Math.floor(i / 7) + 1}`
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: parseFloat(resolutionRate.toFixed(1))
      });
    }
    
    return result;
  }, [timeRange]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
        />
        <YAxis 
          domain={[60, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickFormatter={(value) => `${value}%`}
          label={{ 
            value: 'Resolution Rate (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: '#6B7280' }
          }}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, 'Resolution Rate']}
          contentStyle={{
            backgroundColor: '#fff',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            padding: '0.75rem'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="rate" 
          stroke="#3B82F6" 
          strokeWidth={2} 
          dot={{ r: 3, strokeWidth: 2 }}
          activeDot={{ r: 5, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ResolutionRateChart;