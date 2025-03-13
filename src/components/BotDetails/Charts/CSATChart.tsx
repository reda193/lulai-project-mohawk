'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface CSATChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID to filter by specific bot
}

interface CsatData {
  name: string;
  value: number;
  count: number;
}

const CSATChart: React.FC<CSATChartProps> = ({ timeRange, botId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CsatData[]>([]);
  const [averageCsat, setAverageCsat] = useState('0.0');
  const [totalResponses, setTotalResponses] = useState(0);

  useEffect(() => {
    const fetchCsatData = async () => {
      // If no botId is provided, show selection message and don't fetch
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view CSAT data");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate the start date based on timeRange
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
        
        // Construct URL with required botId
        const url = `/api/bot/${botId}/kpi/csat?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        console.log('Fetching CSAT data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const responseData = await response.json();
        console.log('CSAT data received:', responseData);
        
        // Extract distribution data from API response
        const distribution = responseData.summary?.distribution || {};
        
        // Map the data to the format expected by the chart
        const chartData: CsatData[] = [
          { name: 'Very Satisfied (5)', value: distribution[5] || 0, count: Math.round((responseData.summary.totalRatings * (distribution[5] || 0)) / 100) },
          { name: 'Satisfied (4)', value: distribution[4] || 0, count: Math.round((responseData.summary.totalRatings * (distribution[4] || 0)) / 100) },
          { name: 'Neutral (3)', value: distribution[3] || 0, count: Math.round((responseData.summary.totalRatings * (distribution[3] || 0)) / 100) },
          { name: 'Dissatisfied (2)', value: distribution[2] || 0, count: Math.round((responseData.summary.totalRatings * (distribution[2] || 0)) / 100) },
          { name: 'Very Dissatisfied (1)', value: distribution[1] || 0, count: Math.round((responseData.summary.totalRatings * (distribution[1] || 0)) / 100) }
        ];
        
        setData(chartData);
        setAverageCsat(typeof responseData.summary.averageScore === 'number' 
          ? responseData.summary.averageScore.toFixed(1) 
          : parseFloat(String(responseData.summary.averageScore)).toFixed(1));
        setTotalResponses(responseData.summary.totalRatings);
      } catch (err) {
        console.error('Error fetching CSAT data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch CSAT data');
        
        // Set default empty data
        setData([
          { name: 'Very Satisfied (5)', value: 0, count: 0 },
          { name: 'Satisfied (4)', value: 0, count: 0 },
          { name: 'Neutral (3)', value: 0, count: 0 },
          { name: 'Dissatisfied (2)', value: 0, count: 0 },
          { name: 'Very Dissatisfied (1)', value: 0, count: 0 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCsatData();
  }, [timeRange, botId]);

  const COLORS = ['#22C55E', '#34D399', '#9CA3AF', '#FB923C', '#EF4444'];
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">Loading CSAT data...</div>
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
  if (totalResponses === 0) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center px-5 py-3">
          <div className="text-gray-500">No CSAT data available for this bot and time period</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72 flex flex-col">
      <div className="mb-2 flex justify-center">
        <div className="text-center px-5 py-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-500">Average CSAT Score</div>
          <div className="text-3xl font-bold">{averageCsat}/5</div>
          <div className="text-xs text-gray-400 mt-1">Based on {totalResponses} responses</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => {
              const entry = props.payload as any;
              const formattedValue = typeof value === 'number' 
                ? value.toFixed(1) 
                : parseFloat(String(value)).toFixed(1);
              return [`${formattedValue}% (${entry.count || 0} responses)`, name];
            }}
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
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CSATChart;