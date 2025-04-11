'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define the props interface
interface ResolutionRateChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string;
}

const ResolutionRateChart: React.FC<ResolutionRateChartProps> = ({ timeRange, botId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // If no botId is provided, show selection message and don't fetch
      if (!botId) {
        setLoading(false);
        setError("Please select a bot to view resolution data");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Determine the date range based on timeRange prop
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
          default:
            startDate.setDate(endDate.getDate() - 7);
        }
        
        // Construct the API URL with query parameters
        const url = `/api/bot/${botId}/kpi/resolution?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

        console.log('Fetching resolution data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Resolution data received:', responseData);
        
        // Transform the API response for the chart
        const chartData = responseData.trends.map((trend: any) => {
          // Calculate the overall resolution rate for all bots for this period
          const totalConversations = trend.bots.reduce((sum: number, bot: any) => sum + bot.totalConversations, 0);
          const resolvedConversations = trend.bots.reduce((sum: number, bot: any) => sum + bot.resolvedConversations, 0);
          const resolutionRate = totalConversations > 0 
            ? (resolvedConversations / totalConversations) * 100 
            : 0;
          
          // Format the date for display
          let formattedDate;
          
          if (trend.period.includes('W')) {
            const weekNum = trend.period.split('W')[1];
            formattedDate = `Week ${weekNum}`;
          } else {
            // For daily data, format as "Mon DD"
            const date = new Date(trend.period);
            formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }
          
          return {
            date: formattedDate,
            rate: parseFloat(resolutionRate.toFixed(1))
          };
        });
        
        setData(chartData);
      } catch (err: any) {
        console.error('Error fetching resolution data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch resolution data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, botId]);

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">Loading resolution data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  // Check if data is empty OR if all data points have 0% resolution rate
  const hasNoData = data.length === 0 || data.every(item => item.rate === 0);
  
  if (hasNoData) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">No Resolution Rate data is available for this bot and time period</div>
        </div>
      </div>
    );
  }

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
          domain={[0, 100]}
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