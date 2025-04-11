'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface EscalationRateChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string;
}

const EscalationRateChart: React.FC<EscalationRateChartProps> = ({ timeRange, botId }) => {
  const [data, setData] = useState<any[]>([
    { name: 'Escalated', value: 0 },
    { name: 'Resolved by Bot', value: 100 }
  ]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEscalations, setTotalEscalations] = useState<number>(0);
  const [escalationRate, setEscalationRate] = useState<number>(0);
  const [totalConversations, setTotalConversations] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      // If no botId is provided, show selection message and don't fetch
      if (!botId) {
        setLoading(false);
        setError("Please select a bot to view escalation data");
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
        const url = `/api/bot/${botId}/kpi/escalation?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        console.log('Fetching escalation data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Escalation data received:', responseData);
        
        // Set chart data
        setData(responseData.chartData);
        
        // Set metrics
        setEscalationRate(responseData.summary.escalationRate);
        setTotalEscalations(responseData.summary.escalatedConversations);
        setTotalConversations(responseData.summary.totalConversations || 0);
      } catch (err: any) {
        console.error('Error fetching escalation data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch escalation data');
        
        // Reset data instead of using mock data
        setData([]);
        setEscalationRate(0);
        setTotalEscalations(0);
        setTotalConversations(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, botId]);

  const COLORS = ['#EF4444', '#10B981'];

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">Loading escalation data...</div>
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

  // Check if there's no real data
  const hasNoData = totalConversations === 0 || (totalEscalations === 0 && escalationRate === 0);

  if (hasNoData) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">No Esclation Rate data is available for this bot and time period</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Escalation Rate</div>
          <div className="text-2xl font-bold text-red-500">{escalationRate}%</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-500">Total Escalations</div>
          <div className="text-2xl font-bold">{totalEscalations}</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value}%`, '']}
            contentStyle={{
               backgroundColor: '#fff',
               borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
          <Legend
             layout="horizontal"
             verticalAlign="bottom"
             align="center"
           />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EscalationRateChart;