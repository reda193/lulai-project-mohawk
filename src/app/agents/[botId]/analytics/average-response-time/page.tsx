'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Clock, ArrowLeft, Zap, AlertTriangle, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import ResponseTimeChart from '@/components/BotDetails/Charts/ResponseTimeChart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define types for the response time data
interface ResponseTimeData {
  summary: {
    totalMessages: number;
    averageResponseTimeMs: number;
    averageResponseTimeSec: number;
    minResponseTimeSec: number;
    maxResponseTimeSec: number;
  };
  timeSeriesData: {
    period: string;
    messageCount: number;
    averageResponseTimeMs: number | null;
    averageResponseTimeSec: number | null;
  }[];
}

const ResponseTimePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [responseData, setResponseData] = useState<ResponseTimeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : undefined;
  
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
    setIsMounted(true);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking overlay on mobile
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };
  
  
// Fetch response time data for the analysis sections
useEffect(() => {
  const fetchResponseTimeData = async () => {
    if (!agentId) {
      setIsLoading(false);
      setError('No agent ID found');
      return;
    }
    
    if (status === 'unauthenticated') {
      router.replace('/');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on selected timeRange
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
      
      // First check if user has access to this bot
      const botResponse = await fetch(`/api/bot/${agentId}`);
      
      // If the response is not OK and the user is not admin, redirect immediately
      if (!botResponse.ok && session?.user?.role !== 'ADMIN') {
        console.log('Unauthorized access, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }
      
      // Use the API endpoint to get response time data
      const url = `/api/bot/${agentId}/kpi/response?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=day`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch response time data. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response time data for analysis:', data);
      
      setResponseData(data);
    } catch (err) {
      console.error('Error fetching response data for analysis:', err);
      
      // Redirect non-admin users when there's an error
      if (session?.user?.role !== 'ADMIN') {
        console.log('Error occurred, redirecting to dashboard');
        router.replace('/dashboard');
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch response time data');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchResponseTimeData();
}, [agentId, timeRange, router, session, status]);
  
  // Format a number to a fixed number of decimal places
  const formatNumber = (num: number | null | undefined, decimals = 2): string => {
    if (num === null || num === undefined) return '0.00';
    return num.toFixed(decimals);
  };
  
  // Get the previous period's average response time (simple calculation for demo)
  const getPreviousPeriodValue = (): number => {
    if (!responseData || !responseData.summary) return 0;
    
    // This is a simplified approach - in production you'd want to 
    // actually fetch data from the previous period
    return responseData.summary.averageResponseTimeSec * 1.1; // Assume 10% improvement
  };
  
  // Calculate the difference for trend indicators
  const calculateDifference = (current: number, previous: number): string => {
    const diff = previous - current;
    return diff.toFixed(1);
  };

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
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Average Response Time</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    Average time taken for the bot to respond to user queries
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
            
            {/* Response Time Chart - Only render on client - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-yellow-500 flex-shrink-0" />
                <span className="truncate">Average Response Time</span>
              </h2>
              {isMounted ? (
                <div className="w-full overflow-hidden">
                  <ResponseTimeChart timeRange={timeRange} botId={agentId} />
                </div>
              ) : (
                <div className="h-40 sm:h-72 flex items-center justify-center">
                  <div className="animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
                </div>
              )}
            </div>
            
            {/* Response Time Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Response Time Analysis</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-gray-500 py-6 sm:py-10">
                  {error}
                </div>
              ) : !responseData ? (
                <div className="text-center text-gray-500 py-6 sm:py-10">
                  No response time data available
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Average Response Time</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {isMounted ? formatNumber(responseData.summary.averageResponseTimeSec) : '0.00'} seconds
                      </p>
                      {isMounted && getPreviousPeriodValue() > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="text-green-500">
                            ↓ {calculateDifference(
                              responseData.summary.averageResponseTimeSec,
                              getPreviousPeriodValue()
                            )}s
                          </span> from previous
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Fastest Response</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {isMounted ? formatNumber(responseData.summary.minResponseTimeSec) : '0.00'} seconds
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Simple queries</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Slowest Response</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {isMounted ? formatNumber(responseData.summary.maxResponseTimeSec) : '0.00'} seconds
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Complex technical queries</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Response Time</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                      <li>Optimize knowledge base retrieval for complex queries</li>
                      <li>Pre-cache common responses for frequently asked questions</li>
                      <li>Implement progressive responses for queries requiring longer processing</li>
                      {isMounted && responseData.summary.averageResponseTimeSec > 2 && (
                        <li>Consider upgrading to a faster model for critical workflows</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Response Time by Query Type - Always the same, no client-side calculations - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Response Time by Query Type</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="overflow-x-auto -mx-4 sm:-mx-0">
                  <div className="inline-block min-w-full align-middle p-4 sm:p-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Query Type
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Volume
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg Time
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                            90th %ile
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trend
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            Simple FAQs
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            532
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            0.8s
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            1.2s
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-green-500">
                            ↓ 0.2s
                          </td>
                        </tr>
                        {/* For space reasons, just keeping one row */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Factors - Wrap the problematic visualization in isMounted check - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Response Time Factors</h2>
              <div className="space-y-3 sm:space-y-4">
                {/* Peak Traffic Hours visualization - THIS is the problematic part */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Peak Traffic Hours</h3>
                  
                  {isMounted ? (
                    <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="flex flex-col items-center min-w-[24px] sm:min-w-[32px]"
                        >
                          <div className="text-xs text-gray-500 mb-1">{i}h</div>
                          <div 
                            className={`w-4 sm:w-6 ${
                              // Simulate a typical workday traffic pattern
                              i >= 9 && i <= 17 
                                ? (i >= 10 && i <= 15 ? 'bg-red-500' : 'bg-orange-400')
                                : (i >= 6 && i <= 20 ? 'bg-blue-400' : 'bg-green-400')
                            } rounded-t-sm`}
                            style={{ 
                              height: `${
                                // Simulate traffic pattern heights
                                i >= 10 && i <= 15 
                                  ? 30 + Math.sin((i - 10) * 0.5) * 20 
                                  : i >= 6 && i <= 20 
                                    ? 15 + i * 0.7
                                    : 8
                              }px` 
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-24 sm:h-40 flex items-center justify-center">
                      <div className="animate-pulse h-16 w-full bg-gray-200 rounded"></div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap justify-center mt-3 text-xs">
                    <div className="flex items-center mr-3 mb-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 mr-1"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center mr-3 mb-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-orange-400 mr-1"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center mr-3 mb-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 mr-1"></div>
                      <span>Normal</span>
                    </div>
                    <div className="flex items-center mb-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-400 mr-1"></div>
                      <span>Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseTimePage;