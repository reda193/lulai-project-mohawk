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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [coverageData, setCoverageData] = useState<CoverageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        {/* Navigation shows only on agent detail pages - pass the ID from path */}
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
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Training Coverage</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    How well your training data covers common user queries
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
            
            {/* Training Coverage Chart - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-purple-500 flex-shrink-0" />
                <span className="truncate">Training Coverage</span>
              </h2>
              {isLoading ? (
                <div className="flex items-center justify-center h-48 sm:h-72">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 h-48 sm:h-72 flex items-center justify-center text-sm sm:text-base">
                  {error}
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <TrainingCoverageChart 
                    timeRange={timeRange} 
                    botId={agentId || ''} 
                  />
                </div>
              )}
            </div>
            
            {/* Training Coverage Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Training Coverage Insights</h2>
              {isLoading || !coverageData ? (
                <div className="flex items-center justify-center h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 text-sm sm:text-base">
                  {error}
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Overall Coverage</h3>
                      <p className="text-base sm:text-lg font-semibold">{coverageData.summary.coveragePercentage.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Unique Queries</h3>
                      <p className="text-base sm:text-lg font-semibold">{coverageData.summary.totalUniqueQueries}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Covered Intents</h3>
                      <p className="text-base sm:text-lg font-semibold">{coverageData.summary.coveredIntents}</p>
                    </div>
                  </div>
                  {coverageData.recommendations && coverageData.recommendations.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Coverage</h3>
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
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