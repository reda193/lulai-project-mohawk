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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [csatData, setCsatData] = useState<CSATData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  // Handle responsive behavior
  useEffect(() => {
    // Check screen size and set responsive states
    const checkScreenSize = () => {
      const windowWidth = window.innerWidth;
      setIsMobile(windowWidth < 768);
      
      // Initial sidebar state
      if (windowWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Check on mount
    checkScreenSize();
    
    // Previous width tracking for detecting size changes
    let prevWidth = window.innerWidth;
    
    // Add resize listener that closes sidebar on any size change
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      
      // If the width has changed at all, close the sidebar
      if (windowWidth !== prevWidth) {
        setIsSidebarOpen(false);
        prevWidth = windowWidth;
      }
      
      // Update mobile state
      setIsMobile(windowWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking overlay on mobile
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

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
    if (!csatData?.summary?.trend) return { text: 'Stable', icon: <Minus className="w-3 h-3 sm:w-4 sm:h-4" />, color: 'text-gray-500' };
    
    switch (csatData.summary.trend) {
      case 'improving':
        return { text: 'Improving', icon: <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />, color: 'text-green-500' };
      case 'declining':
        return { text: 'Declining', icon: <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />, color: 'text-red-500' };
      default:
        return { text: 'Stable', icon: <Minus className="w-3 h-3 sm:w-4 sm:h-4" />, color: 'text-gray-500' };
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
      {/* Mobile overlay for sidebar */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(prev => !prev)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
        aria-label="Toggle menu"
      >
        <MenuIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}
        w-full
      `}>
        {/* Navigation */}
        <AgentNavigation agentId={agentId || ''} />

        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto">
          <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link href={`/agents/${agentId}/analytics`} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Customer Satisfaction</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    Average customer satisfaction score over time
                  </div>
                </div>
              </div>
              
              {/* Time range selector - Responsive */}
              <div className="bg-white rounded-lg shadow flex overflow-hidden self-start sm:self-center">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    className={`py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium ${
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
            
            {/* Chart - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0" />
                <span className="truncate">Customer Satisfaction</span>
              </h2>
              <div className="w-full overflow-hidden">
                <CSATChart timeRange={timeRange} botId={agentId || ''} />
              </div>
            </div>
            
            {/* Additional Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">CSAT Insights</h2>
              
              {isLoading ? (
                <div className="py-6 sm:py-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p className="text-sm">Loading CSAT insights...</p>
                </div>
              ) : error ? (
                <div className="py-6 sm:py-8 text-center text-red-500 text-sm sm:text-base">
                  {error}
                </div>
              ) : !csatData ? (
                <div className="py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                  No CSAT data available
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Average CSAT</h3>
                      <p className="text-base sm:text-lg font-semibold">
                        {csatData.summary.averageScore.toFixed(1)}/5
                        <span className="text-gray-400 text-xs sm:text-sm ml-2">
                          ({csatData.summary.totalRatings} ratings)
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Highest Rated Category</h3>
                      <p className="text-base sm:text-lg font-semibold truncate">{getHighestRatedCategory()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Trend</h3>
                      <p className={`text-base sm:text-lg font-semibold flex items-center ${trend.color}`}>
                        {trend.icon}
                        <span className="ml-1">{trend.text}</span>
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recommendations to Improve CSAT</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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