'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadGenerationChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID
}

interface LeadData {
  summary: {
    totalLeadConversations: number;
    totalLeadMessages: number;
    conversionRate: number;
    totalConversations: number;
  };
  timeSeriesData: Array<{
    period: string;
    leadConversations: number;
    leadMessages: number;
  }>;
  exampleLeads?: Array<{
    conversationId: string;
    leadText: string;
    timestamp: string;
  }>;
}

const LeadGenerationChart: React.FC<LeadGenerationChartProps> = ({ timeRange, botId }) => {
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view lead data");
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
        const groupBy = timeRange === '90d' ? 'month' : timeRange === '30d' ? 'week' : 'day';
        
        // Construct URL with required botId
        const url = `/api/bot/${botId}/kpi/leads?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        
        console.log('Fetching lead generation data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching lead data: ${response.statusText}`);
        }
        
        const responseData: LeadData = await response.json();
        console.log('Lead generation data received:', responseData);
        
        setLeadData(responseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load lead generation data");
        setLeadData(null);
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [timeRange, botId]);

  // Show loading state - updated to match other charts
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">Loading lead generation data...</div>
        </div>
      </div>
    );
  }

  // Show error state - updated to match other charts
  if (error) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">{error}</div>
        </div>
      </div>
    );
  }

  // Check for no data - separated from error check
  if (!leadData || !leadData.summary || leadData.summary.totalLeadConversations === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">No Lead Generation data is available for this bot and time period</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72">
      <div className="text-center mb-2">
        <div className="text-sm text-gray-500">Total Lead Conversations</div>
        <div className="text-2xl font-bold">
          {leadData.summary.totalLeadConversations.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500">
          Conversion Rate: {leadData.summary.conversionRate.toFixed(1)}%
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={leadData.timeSeriesData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [value.toLocaleString(), 'Lead Conversations']}
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Bar 
            dataKey="leadConversations" 
            fill="#6366F1" 
            radius={[4, 4, 0, 0]} 
            barSize={timeRange === '7d' ? 30 : 50} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadGenerationChart;