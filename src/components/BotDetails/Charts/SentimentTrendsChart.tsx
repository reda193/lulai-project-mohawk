'use client';

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentTrendsChartProps {
  timeRange: '7d' | '30d' | '90d';
}

// Seeded random number generator
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const SentimentTrendsChart: React.FC<SentimentTrendsChartProps> = ({ timeRange }) => {
  // Generate random sentiment data based on time range
  const data = useMemo(() => {
    // Use consistent seeds based on time range
    const seedMap = {
      '7d': 1,
      '30d': 2,
      '90d': 3
    };
    const baseSeed = seedMap[timeRange] || 1;

    let days;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 10; break; // Use fewer points for 30d
      case '90d': days = 12; break; // Use even fewer for 90d
      default: days = 7;
    }
    
    const result = [];
    
    for (let i = 0; i < days; i++) {
      let label;
      
      if (timeRange === '7d') {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeRange === '30d') {
        label = `Week ${Math.floor(i / 2.5) + 1}`;
      } else {
        label = `Month ${Math.floor(i / 4) + 1}`;
      }
      
      // Use seeded random for consistent "randomness"
      const positiveSeed = baseSeed + i;
      const neutralSeed = baseSeed + i + 100;
      const negativeSeed = baseSeed + i + 200;
      
      // Generate sentiment values with a positive bias
      const positive = 45 + Math.floor(seededRandom(positiveSeed) * 30);
      const neutral = 15 + Math.floor(seededRandom(neutralSeed) * 20);
      const negative = 100 - positive - neutral;
      
      result.push({
        name: label,
        positive,
        neutral, 
        negative
      });
    }
    
    return result;
  }, [timeRange]);

  // Calculate average sentiment
  const averageSentiment = useMemo(() => {
    const totalPositive = data.reduce((sum, item) => sum + item.positive, 0);
    const totalNegative = data.reduce((sum, item) => sum + item.negative, 0);
    const totalNeutral = data.reduce((sum, item) => sum + item.neutral, 0);
    
    return {
      positive: Math.round(totalPositive / data.length),
      neutral: Math.round(totalNeutral / data.length),
      negative: Math.round(totalNegative / data.length),
    };
  }, [data]);

  return (
    <div className="h-72">
      <div className="flex justify-around mb-2">
        <div className="text-center">
          <div className="text-xs text-gray-500">Positive</div>
          <div className="text-lg font-bold text-green-500">{averageSentiment.positive}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Neutral</div>
          <div className="text-lg font-bold text-gray-500">{averageSentiment.neutral}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Negative</div>
          <div className="text-lg font-bold text-red-500">{averageSentiment.negative}%</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value}%`, '']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} dot={{ strokeWidth: 2 }} />
          <Line type="monotone" dataKey="neutral" stroke="#9CA3AF" strokeWidth={2} dot={{ strokeWidth: 2 }} />
          <Line type="monotone" dataKey="negative" stroke="#EF4444" strokeWidth={2} dot={{ strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentTrendsChart;