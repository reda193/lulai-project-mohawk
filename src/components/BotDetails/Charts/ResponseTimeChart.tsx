'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResponseTimeChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID to filter by specific bot
}

const ResponseTimeChart: React.FC<ResponseTimeChartProps> = ({ timeRange, botId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [avgResponseTime, setAvgResponseTime] = useState('0.0');
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    const fetchResponseTimeData = async () => {
      // If no botId is provided, show selection message and don't fetch
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view response time data");
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
        const url = `/api/bot/${botId}/kpi/response?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        
        console.log('Fetching response time data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Response time data received:', responseData);
        
        // Format data for the chart - filter out null values
        const formattedChartData = (responseData.timeSeriesData || [])
          .filter((point: any) => point.averageResponseTimeSec !== null)
          .map((point: any) => ({
            name: point.period,
            time: point.averageResponseTimeSec || 0,
            messageCount: point.messageCount
          }));
        
        setChartData(formattedChartData);
        
        // Set stats from summary
        if (responseData.summary) {
          setAvgResponseTime(typeof responseData.summary.averageResponseTimeSec === 'number'
            ? responseData.summary.averageResponseTimeSec.toFixed(2)
            : '0.00');
          setTotalMessages(responseData.summary.totalMessages || 0);
        }
      } catch (err) {
        console.error('Error fetching response time data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch response time data');
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResponseTimeData();
  }, [timeRange, botId]);

  // Display loading state
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading response time data...</p>
        </div>
      </div>
    );
  }
  
  // Display error or selection state
  if (error) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">{error}</div>
        </div>
      </div>
    );
  }
  
  // Display empty state
  if (chartData.length === 0 || totalMessages === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">No  Average Response Time data is available for this bot and time period</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72 flex flex-col">
      <div className="mb-2 flex justify-center">
        <div className="text-center px-5 py-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Average Response Time</div>
          <div className="text-3xl font-bold">{avgResponseTime}s</div>
          <div className="text-xs text-gray-400 mt-1">Based on {totalMessages.toLocaleString()} messages</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
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
            formatter={(value: number) => [`${value.toFixed(2)}s`, 'Response Time']}
            labelFormatter={(label) => `${label}`}
            itemStyle={{ color: '#F59E0B' }}
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