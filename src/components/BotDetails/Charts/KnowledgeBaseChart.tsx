'use client';

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface KnowledgeBaseChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string;
}

const KnowledgeBaseChart: React.FC<KnowledgeBaseChartProps> = ({ timeRange, botId }) => {
  const [kbUtilizationPercentage, setKbUtilizationPercentage] = useState<number>(0);
  const [totalResponses, setTotalResponses] = useState<number>(0);
  const [kbResponses, setKbResponses] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if no botId is provided
    if (!botId) {
      setLoading(false);
      setError("Please select a bot to view knowledge base data");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Calculate date range based on timeRange
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
        
        // Fetch knowledge base metrics from API
        const url = `/api/bot/${botId}/kpi/knowledge?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        
        // Set data from API response
        setKbUtilizationPercentage(responseData.summary.kbUtilizationPercentage || 0);
        setTotalResponses(responseData.summary.totalBotResponses || 0);
        setKbResponses(responseData.summary.responsesUsingKB || 0);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching knowledge base data:', err);
        setError(err.message || 'Failed to fetch knowledge base data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, botId]);

  // Prepare data for the bar chart
  const chartData = [
    {
      name: 'Knowledge Base Utilization',
      value: kbUtilizationPercentage
    }
  ];

  // Get color based on KBU percentage
  const getBarColor = () => {
    if (kbUtilizationPercentage >= 80) return '#22C55E'; // Good (green)
    if (kbUtilizationPercentage >= 50) return '#F59E0B'; // Medium (amber)
    return '#EF4444'; // Low (red)
  };

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-gray-500">Loading knowledge base data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-gray-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-72">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">Knowledge Base Utilization</h3>
        <div className="text-2xl font-bold">{kbUtilizationPercentage}%</div>
        <div className="text-sm text-gray-500">
          {kbResponses} of {totalResponses} responses use knowledge base
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="70%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tickCount={6}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, 'Knowledge Base Utilization']}
            contentStyle={{
              backgroundColor: '#fff',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <ReferenceLine x={50} stroke="#9CA3AF" strokeDasharray="3 3" />
          <ReferenceLine x={80} stroke="#9CA3AF" strokeDasharray="3 3" />
          <Bar 
            dataKey="value" 
            fill={getBarColor()} 
            barSize={30} 
            radius={[0, 4, 4, 0]}
            label={{ 
              position: 'right', 
              fill: '#000', 
              formatter: (value: any) => `${value}%` 
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KnowledgeBaseChart;