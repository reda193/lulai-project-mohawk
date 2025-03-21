'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Users, ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import CSATChart from '@/components/BotDetails/Charts/CSATChart';

interface CSATData {
  summary: {
    totalRatings: number;
    averageScore: number;
    distribution: Record<string, number>;
    satisfaction: {
      high: number;
      medium: number;
      low: number;
    };
    trend: string;
  };
  timeframe: {
    start: string;
    end: string;
  };
  bot?: {
    id: string;
    name: string;
  };
}

const CSATPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [csatData, setCsatData] = useState<CSATData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  // Fetch CSAT data from API
  useEffect(() => {
    const fetchCsatData = async () => {
      if (!agentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate dates based on timeRange
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
        
        const url = `/api/bot/${agentId}/kpi/csat?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        
        console.log('Fetching CSAT data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('CSAT data received:', data);
        
        setCsatData(data);
      } catch (err) {
        console.error('Error fetching CSAT data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch CSAT data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCsatData();
  }, [agentId, timeRange]);

  // Find highest rated category based on distribution
  const getHighestRatedCategory = () => {
    if (!csatData?.summary?.distribution) return 'N/A';
    
    // Simplified categories mapping
    const categories = {
      '5': 'Excellent Service',
      '4': 'Product Knowledge',
      '3': 'Response Time',
      '2': 'Technical Support',
      '1': 'Issue Resolution'
    };
    
    // Find highest rated score
    const entries = Object.entries(csatData.summary.distribution);
    if (entries.length === 0) return 'N/A';
    
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return categories[sorted[0][0] as keyof typeof categories] || 'N/A';
  };

  // Format trend direction with icon and color
  const getTrendDisplay = () => {
    if (!csatData?.summary?.trend) return { text: 'Stable', icon: <Minus />, color: 'text-gray-500' };
    
    switch (csatData.summary.trend) {
      case 'improving':
        return { text: 'Improving', icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-500' };
      case 'declining':
        return { text: 'Declining', icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-500' };
      default:
        return { text: 'Stable', icon: <Minus className="w-4 h-4" />, color: 'text-gray-500' };
    }
  };

  // Get recommendations based on data
  const getRecommendations = () => {
    if (!csatData) return [];
    
    const recommendations = [];
    
    // Low scores
    if (csatData.summary.satisfaction.low > 20) {
      recommendations.push("Address negative feedback patterns in low satisfaction responses");
    }
    
    // Medium scores
    if (csatData.summary.satisfaction.medium > 30) {
      recommendations.push("Focus on turning neutral experiences into positive ones");
    }
    
    // Add general recommendations
    recommendations.push("Enhance responses for product pricing questions which have lower satisfaction");
    recommendations.push("Reduce response time for complex queries to improve user experience");
    
    return recommendations.length > 0 ? recommendations : ["No specific recommendations at this time"];
  };

  const trend = getTrendDisplay();

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
        {/* Navigation */}
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
                  <h1 className="text-2xl font-bold text-gray-900">Customer Satisfaction</h1>
                  <div className="text-sm text-gray-500">
                    Average customer satisfaction score over time
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
            
            {/* Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-500" />
                Customer Satisfaction
              </h2>
              <CSATChart timeRange={timeRange} botId={agentId || ''} />
            </div>
            
            {/* Additional Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">CSAT Insights</h2>
              
              {isLoading ? (
                <div className="py-8 text-center text-gray-500">
                  Loading CSAT insights...
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  {error}
                </div>
              ) : !csatData ? (
                <div className="py-8 text-center text-gray-500">
                  No CSAT data available
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Average CSAT</h3>
                      <p className="text-lg font-semibold">
                        {csatData.summary.averageScore.toFixed(1)}/5
                        <span className="text-gray-400 text-sm ml-2">
                          ({csatData.summary.totalRatings} ratings)
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Highest Rated Category</h3>
                      <p className="text-lg font-semibold">{getHighestRatedCategory()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Trend</h3>
                      <p className={`text-lg font-semibold flex items-center ${trend.color}`}>
                        {trend.icon}
                        <span className="ml-1">{trend.text}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Improve CSAT</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {getRecommendations().map((recommendation, index) => (
                        <li key={index}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSATPage;