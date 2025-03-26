'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Brain, ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import TrainingCoverageChart from '@/components/BotDetails/Charts/TrainingCoverageChart';

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

const TrainingCoveragePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    const fetchCoverageInsights = async () => {
      if (!agentId) {
        setError("No agent selected");
        setIsLoading(false);
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
        
        // Construct URL with required agentId
        const url = `/api/bot/${agentId}/kpi/training?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        console.log('Fetching training coverage insights from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching training coverage: ${response.statusText}`);
        }
        
        const responseData: CoverageData = await response.json();
        console.log('Training coverage insights received:', responseData);
        
        setCoverageData(responseData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError("Failed to load training coverage insights");
        setCoverageData(null);
        setIsLoading(false);
      }
    };

    fetchCoverageInsights();
  }, [agentId, timeRange]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
      >
        <MenuIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        {/* Navigation shows only on agent detail pages - pass the ID from path */}
        <AgentNavigation agentId={agentId || ''} />

        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Link href={`/agents/${agentId}/analytics`} className="p-2 rounded-full hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Training Coverage</h1>
                  <div className="text-sm text-gray-500">
                    How well your training data covers common user queries
                  </div>
                </div>
              </div>
              
              {/* Time range selector */}
              <div className="bg-white rounded-lg shadow flex overflow-hidden">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    className={`py-2 px-4 text-sm font-medium ${
                      timeRange === range 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setTimeRange(range as '7d' | '30d' | '90d')}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Training Coverage Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-500" />
                Training Coverage
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 h-72 flex items-center justify-center">
                  {error}
                </div>
              ) : (
                <TrainingCoverageChart 
                  timeRange={timeRange} 
                  botId={agentId || ''} 
                />
              )}
            </div>
            
            {/* Training Coverage Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Training Coverage Insights</h2>
              {isLoading || !coverageData ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Overall Coverage</h3>
                      <p className="text-lg font-semibold">{coverageData.summary.coveragePercentage.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Unique Queries</h3>
                      <p className="text-lg font-semibold">{coverageData.summary.totalUniqueQueries}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Covered Intents</h3>
                      <p className="text-lg font-semibold">{coverageData.summary.coveredIntents}</p>
                    </div>
                  </div>
                  {coverageData.recommendations && coverageData.recommendations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Coverage</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {coverageData.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCoveragePage;