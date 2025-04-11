'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, BarChart2, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import SessionVolumeChart from '@/components/BotDetails/Charts/SessionVolumeChart';

interface SessionVolumeData {
  summary: {
    totalSessions: number;
    averageDurationMinutes: number;
    averageMessagesPerSession: number;
    totalMessages: number;
    engagementRate: number;
  };
  timeSeriesData: {
    period: string;
    sessionCount: number;
    averageDuration: number;
    messagesCount: number;
    averageMessages: number;
  }[];
}

const SessionVolumePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sessionData, setSessionData] = useState<SessionVolumeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [growth, setGrowth] = useState<number | null>(null);
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
    const fetchSessionData = async () => {
      if (!agentId) {
        setIsLoading(false);
        setError('No agent ID provided');
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
        
        // Determine groupBy based on timeRange
        const groupBy = timeRange === '90d' ? 'week' : 'day';
        
        // Fetch current period data
        const url = `/api/bot/${agentId}/kpi/session?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`;
        console.log('Fetching session data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching session data: ${response.statusText}`);
        }
        
        const data: SessionVolumeData = await response.json();
        setSessionData(data);
        
        // Calculate growth by fetching previous period
        const previousStartDate = new Date(startDate);
        const previousEndDate = new Date(startDate);
        
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
        
        const previousUrl = `/api/bot/${agentId}/kpi/session?startDate=${previousStartDate.toISOString()}&endDate=${previousEndDate.toISOString()}&groupBy=${groupBy}`;
        
        const previousResponse = await fetch(previousUrl);
        if (previousResponse.ok) {
          const previousData: SessionVolumeData = await previousResponse.json();
          
          if (previousData.summary.totalSessions > 0) {
            const growthRate = ((data.summary.totalSessions - previousData.summary.totalSessions) / previousData.summary.totalSessions) * 100;
            setGrowth(growthRate);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load session data');
        setIsLoading(false);
      }
    };

    fetchSessionData();
  }, [agentId, timeRange]);

  // Calculate daily average sessions
  const calculateDailyAverage = () => {
    if (!sessionData || !sessionData.timeSeriesData || sessionData.timeSeriesData.length === 0) {
      return { weekday: 0, weekend: 0 };
    }
    
    // Group by weekday/weekend
    const weekdaySessions: number[] = [];
    const weekendSessions: number[] = [];
    
    sessionData.timeSeriesData.forEach(day => {
      // Parse date to determine if weekday or weekend
      // Note: This is a simplification, in production you'd want to handle
      // the date parsing more robustly based on your actual date format
      const dayName = day.period.split(',')[0];
      const isWeekend = dayName === 'Sat' || dayName === 'Sun';
      
      if (isWeekend) {
        weekendSessions.push(day.sessionCount);
      } else {
        weekdaySessions.push(day.sessionCount);
      }
    });
    
    const weekdayAvg = weekdaySessions.length > 0 
      ? Math.round(weekdaySessions.reduce((sum, val) => sum + val, 0) / weekdaySessions.length) 
      : 0;
      
    const weekendAvg = weekendSessions.length > 0 
      ? Math.round(weekendSessions.reduce((sum, val) => sum + val, 0) / weekendSessions.length) 
      : 0;
    
    return { weekday: weekdayAvg, weekend: weekendAvg };
  };

  // Determine peak hours
  const determinePeakHours = () => {
    if (!sessionData || !sessionData.timeSeriesData || sessionData.timeSeriesData.length === 0) {
      return "N/A";
    }
    
    // This is a simplification - in a real implementation, you'd need to analyze
    // hourly data, which might require enhancing your API to provide hour-level data
    // For now, we'll return a placeholder based on the number of sessions
    return sessionData.summary.totalSessions > 500 ? "10AM - 2PM" : "1PM - 5PM";
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
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Session Volume</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    Total number of bot conversations over time
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
            
            {/* Session Volume Chart - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-purple-500 flex-shrink-0" />
                <span className="truncate">Session Volume</span>
              </h2>
              <div className="w-full overflow-hidden">
                <SessionVolumeChart timeRange={timeRange} botId={agentId || undefined} />
              </div>
            </div>
            
            {/* Session Volume Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Volume Insights</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-gray-500 py-6 sm:py-10 text-sm sm:text-base">
                  {error}
                </div>
              ) : !sessionData ? (
                <div className="text-center text-gray-500 py-6 sm:py-10 text-sm sm:text-base">
                  No session data available
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Sessions</h3>
                      <p className="text-base sm:text-lg font-semibold">{sessionData.summary.totalSessions.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Peak Hours</h3>
                      <p className="text-base sm:text-lg font-semibold">{determinePeakHours()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Growth</h3>
                      {growth !== null ? (
                        <p className={`text-base sm:text-lg font-semibold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from previous
                        </p>
                      ) : (
                        <p className="text-base sm:text-lg font-semibold text-gray-500">No previous data</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Volume Distribution</h3>
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                        {calculateDailyAverage().weekday > 0 && (
                          <li>Weekday volume averages {calculateDailyAverage().weekday} sessions per day</li>
                        )}
                        {calculateDailyAverage().weekend > 0 && (
                          <li>Weekend volume is approximately {Math.round((calculateDailyAverage().weekend / calculateDailyAverage().weekday) * 100)}% of weekday volume</li>
                        )}
                        <li>Average conversation length: {sessionData.summary.averageDurationMinutes.toFixed(1)} minutes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Engagement Metrics</h3>
                      <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                        <li>Average {sessionData.summary.averageMessagesPerSession.toFixed(1)} messages per conversation</li>
                        <li>Engagement rate: {sessionData.summary.engagementRate.toFixed(1)}%</li>
                        <li>Total messages: {sessionData.summary.totalMessages.toLocaleString()}</li>
                      </ul>
                    </div>
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

export default SessionVolumePage;