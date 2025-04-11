'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SessionVolumeChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID
}

interface SessionVolumeData {
  summary: {
    totalSessions: number;
    averageDurationMinutes: number;
    averageMessagesPerSession: number;
    totalMessages: number;
    engagementRate: number;
  };
  timeSeriesData: {
    period: string;
    sessionCount: number;
    averageDuration: number;
    messagesCount: number;
    averageMessages: number;
  }[];
}

const SessionVolumeChart: React.FC<SessionVolumeChartProps> = ({ timeRange, botId }) => {
  const [data, setData] = useState<any[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view session data");
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
        const url = `/api/bot/${botId}/kpi/session?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        
        console.log('Fetching session volume data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching session data: ${response.statusText}`);
        }
        
        const responseData: SessionVolumeData = await response.json();
        console.log('Session volume data received:', responseData);
        
        // Transform data for the chart
        const chartData = responseData.timeSeriesData.map(item => ({
          name: item.period,
          sessions: item.sessionCount
        }));
        
        setData(chartData);
        setTotalSessions(responseData.summary.totalSessions);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load session data");
        setData([]);
        setTotalSessions(0);
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [timeRange, botId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Show error or no data state
  if (error || data.length === 0 || totalSessions === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center text-gray-500">
          {error || "No session data is available for this bot and time period"}
        </div>
      </div>
    );
  }

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