'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface UnrecognizedQueriesChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Added botId prop
}

const UnrecognizedQueriesChart: React.FC<UnrecognizedQueriesChartProps> = ({ timeRange, botId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQueries, setTotalQueries] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      // If no botId is provided, show selection message and don't fetch
      if (!botId) {
        setLoading(false);
        setError("Please select a bot to view unrecognized queries data");
        return;
      }
      console.log('BotId: ', botId)

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
        const url = `/api/bot/${botId}/kpi/unrecognized?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;

        console.log('Fetching unrecognized queries data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('Unrecognized queries data received:', responseData);
        
        // Set the total number of unrecognized queries
        setTotalQueries(responseData.summary?.totalUnrecognizedQueries || 0);
        
        // Transform API response data for the chart - note the property name changes
        // The API returns { category, count, percentage } but we need { name, value }
        if (responseData.categories && responseData.categories.length > 0) {
          const chartData = responseData.categories.map((item: any) => ({
            name: item.category, // Changed from category.name to match API
            value: item.count // Changed from category.count to match API
          })).sort((a: any, b: any) => b.value - a.value).slice(0, 5); // Top 5 categories
          
          setData(chartData);
        } else {
          setData([]);
        }
      } catch (err: any) {
        console.error('Error fetching unrecognized queries data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch unrecognized queries data');
        setData([]);
        setTotalQueries(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, botId]);

  const COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#FFEDD5'];

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">Loading unrecognized queries data...</div>
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

  if (data.length === 0 || totalQueries === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">NO UNRECOGNIZED QUERIES DATA IS AVAILABLE FOR THIS BOT AND TIME PERIOD</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72">
      <div className="mb-3 text-center">
        <div className="text-sm text-gray-500">Total Unrecognized Queries</div>
        <div className="text-2xl font-bold">{totalQueries}</div>
      </div>
      
      <ResponsiveContainer width="100%" height="75%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#6B7280', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, 'Queries']}
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none',
              padding: '0.75rem'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UnrecognizedQueriesChart;