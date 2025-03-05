'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponseTimeChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ timeRange }) => {
  // Generate random data based on time range
  const data = useMemo(() => {
    let days;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 30;
    }

    // Use a consistent seed based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const baseSeed = seedMap[timeRange] || 1;

    // Use fewer data points for longer time ranges
    const interval = days > 30 ? 7 : days > 7 ? 3 : 1;
    const numPoints = Math.ceil(days / interval);

    const result = [];
    let prevTime = 2.5; // Starting point in seconds

    for (let i = 0; i < numPoints; i++) {
      // Use seeded random for consistent "randomness"
      const trend = -0.5 * (i / numPoints);
      const noise = (seededRandom(baseSeed + i) - 0.5) * 0.8;
      prevTime = Math.max(0.8, prevTime + trend + noise);

      const date = new Date();
      date.setDate(date.getDate() - (numPoints - i - 1) * interval);

      result.push({
        name: timeRange === '90d'
          ? `Week ${Math.floor(i / 4) + 1}`
          : timeRange === '30d'
           ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
           : date.toLocaleDateString('en-US', { weekday: 'short' }),
        time: parseFloat(prevTime.toFixed(2))
      });
    }

    return result;
  }, [timeRange]);

  // Calculate average response time
  const avgResponseTime = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + item.time, 0);
    return (sum / data.length).toFixed(2);
  }, [data]);

  return (
    <div className="h-72">
      <div className="text-center mb-2">
        <div className="text-sm text-gray-500">Average Response Time</div>
        <div className="text-2xl font-bold">{avgResponseTime}s</div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
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
            tickFormatter={(value) => `${value}s`}
          />
          <Tooltip
            formatter={(value: number) => [`${value}s`, 'Response Time']}
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
            dataKey="time"
            stroke="#F59E0B"
            fill="#FEF3C7"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeChart;