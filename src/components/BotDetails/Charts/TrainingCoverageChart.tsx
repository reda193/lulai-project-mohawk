'use client';

import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TrainingCoverageChartProps {
  timeRange: '7d' | '30d' | '90d';
  botId?: string; // Optional bot ID
}

interface CoverageData {
  summary: {
    totalUniqueQueries: number;
    coveredIntents: number;
    coveragePercentage: number;
    latestMeasurement: string | null;
  };
  history: {
    date: string;
    totalQueries: number;
    coveredIntents: number;
    coveragePercentage: number;
  }[];
  recommendations: string[];
}

const TrainingCoverageChart: React.FC<TrainingCoverageChartProps> = ({ timeRange, botId }) => {
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoverageData = async () => {
      if (!botId) {
        setIsLoading(false);
        setError("Please select a bot to view training coverage");
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
        
        // Construct URL with required botId
        const url = `/api/bot/${botId}/kpi/training?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        console.log('Fetching training coverage data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching training coverage: ${response.statusText}`);
        }
        
        const responseData: CoverageData = await response.json();
        console.log('Training coverage data received:', responseData);
        
        setCoverageData(responseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load training coverage data");
        setCoverageData(null);
        setIsLoading(false);
      }
    };

    fetchCoverageData();
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
  if (error || !coverageData) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center text-gray-500">
          {error || "No training coverage data available"}
        </div>
      </div>
    );
  }

  // Data for pie chart
  const data = [
    { name: 'Covered', value: coverageData.summary.coveragePercentage },
    { name: 'Uncovered', value: 100 - coverageData.summary.coveragePercentage },
  ];

  const COLORS = ['#8B5CF6', '#E9D5FF'];

  return (
    <div className="h-72 flex flex-col items-center justify-center">
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <div className="text-3xl font-bold">{coverageData.summary.coveragePercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Coverage</div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
          <span className="text-gray-700">{coverageData.summary.coveragePercentage.toFixed(1)}% of queries covered by training</span>
        </div>
        <div className="text-sm mt-1">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-200 mr-2"></span>
          <span className="text-gray-700">{(100 - coverageData.summary.coveragePercentage).toFixed(1)}% uncovered queries</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Total Unique Queries: {coverageData.summary.totalUniqueQueries}
          <br />
          Covered Intents: {coverageData.summary.coveredIntents}
        </div>

      </div>
    </div>
  );
};

export default TrainingCoverageChart;