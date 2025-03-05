'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionVolumeChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const SessionVolumeChart: React.FC<SessionVolumeChartProps> = ({ timeRange }) => {
  // Generate random data based on time range
  const data = useMemo(() => {
    let days;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }
    
    // Use consistent seeds based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const baseSeed = seedMap[timeRange] || 1;
    
    // Generate based on days, but if too many days, create weekly data points instead
    const interval = days > 30 ? 7 : 1;
    const labels = days > 30 ? 'weeks' : 'days';
    
    let previousValue = 30 + seededRandom(baseSeed) * 20; // Starting point
    
    const result = [];
    
    for (let i = 0; i < days; i += interval) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Use seeded random for consistent "randomness"
      const change = (seededRandom(baseSeed + i) - 0.3) * 15; // Slightly biased toward growth
      previousValue = Math.max(10, previousValue + change);
      
      // Add weekly pattern (more usage on weekdays)
      const dayOfWeek = date.getDay();
      const weekdayBoost = dayOfWeek >= 1 && dayOfWeek <= 5 ? 20 : 0;
      
      result.push({
        name: labels === 'weeks' 
          ? `Week ${Math.floor(i / 7) + 1}` 
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: Math.round(previousValue + weekdayBoost)
      });
    }
    
    return result;
  }, [timeRange]);

  // Calculate total sessions
  const totalSessions = useMemo(() => {
    return data.reduce((sum, item) => sum + item.sessions, 0);
  }, [data]);

  return (
    <div className="h-72">
      <div className="mb-2">
        <span className="text-sm text-gray-500">Total sessions:</span>
        <span className="ml-2 font-medium">{totalSessions.toLocaleString()}</span>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
          />
          <Tooltip 
            formatter={(value: number) => [value.toLocaleString(), 'Sessions']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="sessions" 
            stroke="#8B5CF6" 
            fill="#EDE9FE" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SessionVolumeChart;