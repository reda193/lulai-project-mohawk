'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, TrendingUp, ArrowLeft, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import SentimentTrendsChart from '@/components/BotDetails/Charts/SentimentTrendsChart';

interface SentimentData {
  summary: {
    totalConversations: number;
    averageSentimentScore: number;
    sentimentDistribution: {
      positive: {
        count: number;
        percentage: number;
      };
      neutral: {
        count: number;
        percentage: number;
      };
      negative: {
        count: number;
        percentage: number;
      };
    };
    sentimentTrend: number;
  };
  timeSeriesData: {
    period: string;
    conversationCount: number;
    averageSentiment: number;
    positive: {
      count: number;
      percentage: number;
    };
    neutral: {
      count: number;
      percentage: number;
    };
    negative: {
      count: number;
      percentage: number;
    };
  }[];
}

const SentimentTrendsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [previousSentimentData, setPreviousSentimentData] = useState<SentimentData | null>(null);
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

  // Fetch sentiment data
  useEffect(() => {
    const fetchSentimentData = async () => {
      if (!agentId) {
        setIsLoading(false);
        setError('No agent ID found');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate dates for current period
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
        
        // Determine groupBy based on timeRange
        const groupBy = timeRange === '90d' ? 'week' : 'day';
        
        // Fetch current period data
        const url = `/api/bot/${agentId}/kpi/sentiment?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        console.log('Fetching sentiment data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching sentiment data: ${response.statusText}`);
        }
        
        const data: SentimentData = await response.json();
        setSentimentData(data);
        
        // Calculate dates for previous period to show trend comparison
        const previousEndDate = new Date(startDate);
        const previousStartDate = new Date(startDate);
        
        switch (timeRange) {
          case '7d':
            previousStartDate.setDate(previousStartDate.getDate() - 7);
            break;
          case '30d':
            previousStartDate.setDate(previousStartDate.getDate() - 30);
            break;
          case '90d':
            previousStartDate.setDate(previousStartDate.getDate() - 90);
            break;
        }
        
        // Fetch previous period data for comparison
        const previousUrl = `/api/bot/${agentId}/kpi/sentiment?startDate=${previousStartDate.toISOString()}&endDate=${previousEndDate.toISOString()}&groupBy=${groupBy}`;
        
        const previousResponse = await fetch(previousUrl);
        if (previousResponse.ok) {
          const previousData: SentimentData = await previousResponse.json();
          setPreviousSentimentData(previousData);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load sentiment data');
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, [agentId, timeRange]);

  // Calculate percentage changes from previous period
  const getPercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
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
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Sentiment Trends</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    Analysis of user sentiment throughout conversations
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
            
            {/* Sentiment Trends Chart - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-green-500 flex-shrink-0" />
                <span className="truncate">Sentiment Trends</span>
              </h2>
              <div className="w-full overflow-hidden">
                <SentimentTrendsChart timeRange={timeRange} botId={agentId || undefined} />
              </div>
            </div>
            
            {/* Sentiment Trends Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Sentiment Analysis</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-gray-500 py-6 sm:py-10 text-sm sm:text-base">
                  {error}
                </div>
              ) : !sentimentData ? (
                <div className="text-center text-gray-500 py-6 sm:py-10 text-sm sm:text-base">
                  No sentiment data available
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Positive Sentiment</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {Math.round(sentimentData.summary.sentimentDistribution.positive.percentage)}%
                      </p>
                      {previousSentimentData && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getPercentageChange(
                            sentimentData.summary.sentimentDistribution.positive.percentage,
                            previousSentimentData.summary.sentimentDistribution.positive.percentage
                          ) >= 0 ? (
                            <span className="text-green-500">
                              ↑ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.positive.percentage,
                                previousSentimentData.summary.sentimentDistribution.positive.percentage
                              )))}%
                            </span>
                          ) : (
                            <span className="text-red-500">
                              ↓ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.positive.percentage,
                                previousSentimentData.summary.sentimentDistribution.positive.percentage
                              )))}%
                            </span>
                          )} from previous
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Neutral Sentiment</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {Math.round(sentimentData.summary.sentimentDistribution.neutral.percentage)}%
                      </p>
                      {previousSentimentData && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getPercentageChange(
                            sentimentData.summary.sentimentDistribution.neutral.percentage,
                            previousSentimentData.summary.sentimentDistribution.neutral.percentage
                          ) >= 0 ? (
                            <span className="text-green-500">
                              ↑ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.neutral.percentage,
                                previousSentimentData.summary.sentimentDistribution.neutral.percentage
                              )))}%
                            </span>
                          ) : (
                            <span className="text-red-500">
                              ↓ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.neutral.percentage,
                                previousSentimentData.summary.sentimentDistribution.neutral.percentage
                              )))}%
                            </span>
                          )} from previous
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                        <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Negative Sentiment</h3>
                      </div>
                      <p className="text-base sm:text-lg font-semibold">
                        {Math.round(sentimentData.summary.sentimentDistribution.negative.percentage)}%
                      </p>
                      {previousSentimentData && (
                        <p className="text-xs text-gray-500 mt-1">
                          {getPercentageChange(
                            sentimentData.summary.sentimentDistribution.negative.percentage,
                            previousSentimentData.summary.sentimentDistribution.negative.percentage
                          ) <= 0 ? (
                            <span className="text-green-500">
                              ↓ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.negative.percentage,
                                previousSentimentData.summary.sentimentDistribution.negative.percentage
                              )))}%
                            </span>
                          ) : (
                            <span className="text-red-500">
                              ↑ {Math.abs(Math.round(getPercentageChange(
                                sentimentData.summary.sentimentDistribution.negative.percentage,
                                previousSentimentData.summary.sentimentDistribution.negative.percentage
                              )))}%
                            </span>
                          )} from previous
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Sentiment</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                      {sentimentData.summary.sentimentDistribution.negative.percentage > 10 && (
                        <li>Address known pain points in billing-related conversations</li>
                      )}
                      {sentimentData.summary.sentimentDistribution.neutral.percentage > 20 && (
                        <li>Improve handling of complex technical questions with more detailed responses</li>
                      )}
                      <li>Add more empathetic responses for error scenarios</li>
                      {sentimentData.summary.averageSentimentScore < 0 && (
                        <li>Review and improve responses for high-negative sentiment interactions</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            {/* Sentiment by Topic - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Sentiment by Topic</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="overflow-x-auto -mx-4 sm:-mx-0">
                  <div className="inline-block min-w-full align-middle p-4 sm:p-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Topic
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vol
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="text-green-600">+</span>
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="text-gray-600">~</span>
                          </th>
                          <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="text-red-600">-</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            Account Management
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            485
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-green-600 font-medium">78%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-green-500 h-1 sm:h-1.5 rounded-full" style={{ width: '78%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-gray-600 font-medium">18%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-gray-500 h-1 sm:h-1.5 rounded-full" style={{ width: '18%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-red-600 font-medium">4%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-red-500 h-1 sm:h-1.5 rounded-full" style={{ width: '4%' }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                            Billing & Payments
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            372
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-green-600 font-medium">58%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-green-500 h-1 sm:h-1.5 rounded-full" style={{ width: '58%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-gray-600 font-medium">27%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-gray-500 h-1 sm:h-1.5 rounded-full" style={{ width: '27%' }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-xs sm:text-sm text-red-600 font-medium">15%</div>
                              <div className="w-10 sm:w-16 bg-gray-200 h-1 sm:h-1.5 ml-1 sm:ml-2 rounded-full hidden sm:block">
                                <div className="bg-red-500 h-1 sm:h-1.5 rounded-full" style={{ width: '15%' }}></div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        {/* More rows truncated for brevity */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sentiment Progression - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Sentiment Progression During Conversations</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Analysis of how sentiment changes throughout conversation stages shows that sentiment typically 
                    improves from initial interaction to resolution, with notable variations by topic.
                  </p>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium">Start of Conversation</span>
                        <span className="text-xs sm:text-sm font-medium">End of Conversation</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-1.5 sm:h-2 text-xs flex rounded bg-gray-200">
                          <div style={{ width: "52%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          <div style={{ width: "36%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
                          <div style={{ width: "12%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>52% Positive</span>
                          <span className="hidden sm:inline">36% Neutral</span>
                          <span>12% Negative</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-1.5 sm:h-2 text-xs flex rounded bg-gray-200">
                          <div style={{ width: "68%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          <div style={{ width: "24%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
                          <div style={{ width: "8%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>68% Positive</span>
                          <span className="hidden sm:inline">24% Neutral</span>
                          <span>8% Negative</span>
                        </div>
                      </div>
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

export default SentimentTrendsPage;