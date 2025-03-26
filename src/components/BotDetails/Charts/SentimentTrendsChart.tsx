'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SentimentTrendsChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID
}

interface SentimentData {
  summary: {
    totalConversations: number;
    averageSentimentScore: number;
    sentimentDistribution: {
      positive: {
        count: number;
        percentage: number;
      };
      neutral: {
        count: number;
        percentage: number;
      };
      negative: {
        count: number;
        percentage: number;
      };
    };
    sentimentTrend: number;
  };
  timeSeriesData: {
    period: string;
    conversationCount: number;
    averageSentiment: number;
    positive: {
      count: number;
      percentage: number;
    };
    neutral: {
      count: number;
      percentage: number;
    };
    negative: {
      count: number;
      percentage: number;
    };
  }[];
}

const SentimentTrendsChart: React.FC<SentimentTrendsChartProps> = ({ timeRange, botId }) => {
  const [data, setData] = useState<any[]>([]);
  const [averageSentiment, setAverageSentiment] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seeded random for fallback (reusing your existing function)
  function seededRandom(seed: number) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view sentiment data");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Calculate start date based on selected time range
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }
        
        // Determine groupBy based on timeRange
        const groupBy = timeRange === '90d' ? 'week' : 'day';
        
        // Construct URL with required botId
        const url = `/api/bot/${botId}/kpi/sentiment?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        
        console.log('Fetching sentiment data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching sentiment data: ${response.statusText}`);
        }
        
        const responseData: SentimentData = await response.json();
        console.log('Sentiment data received:', responseData);
        
        // Transform data for the chart
        const chartData = responseData.timeSeriesData.map(item => ({
          name: item.period,
          positive: Math.round(item.positive.percentage),
          neutral: Math.round(item.neutral.percentage),
          negative: Math.round(item.negative.percentage)
        }));
        
        setData(chartData);
        
        // Set the average sentiment from the summary
        if (responseData.summary && responseData.summary.sentimentDistribution) {
          setAverageSentiment({
            positive: Math.round(responseData.summary.sentimentDistribution.positive.percentage),
            neutral: Math.round(responseData.summary.sentimentDistribution.neutral.percentage),
            negative: Math.round(responseData.summary.sentimentDistribution.negative.percentage)
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load sentiment data");
        setData([]);
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, [timeRange, botId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Show error or no data state
  if (error || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center text-gray-500">
          {error || "No sentiment data available"}
        </div>
      </div>
    );
  }

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