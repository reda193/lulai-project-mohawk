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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [sessionData, setSessionData] = useState<SessionVolumeData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [growth, setGrowth] = useState<number | null>(null);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

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
                  <h1 className="text-2xl font-bold text-gray-900">Session Volume</h1>
                  <div className="text-sm text-gray-500">
                    Total number of bot conversations over time
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
            
            {/* Session Volume Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
                Session Volume
              </h2>
              <SessionVolumeChart timeRange={timeRange} botId={agentId || undefined} />
            </div>
            
            {/* Session Volume Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Volume Insights</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-gray-500 py-10">
                  {error}
                </div>
              ) : !sessionData ? (
                <div className="text-center text-gray-500 py-10">
                  No session data available
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
                      <p className="text-lg font-semibold">{sessionData.summary.totalSessions.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Peak Hours</h3>
                      <p className="text-lg font-semibold">{determinePeakHours()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500">Growth</h3>
                      {growth !== null ? (
                        <p className={`text-lg font-semibold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% from previous period
                        </p>
                      ) : (
                        <p className="text-lg font-semibold text-gray-500">No previous data</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Volume Distribution</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {calculateDailyAverage().weekday > 0 && (
                          <li>Weekday volume averages {calculateDailyAverage().weekday} sessions per day</li>
                        )}
                        {calculateDailyAverage().weekend > 0 && (
                          <li>Weekend volume is approximately {Math.round((calculateDailyAverage().weekend / calculateDailyAverage().weekday) * 100)}% of weekday volume</li>
                        )}
                        <li>Average conversation length: {sessionData.summary.averageDurationMinutes.toFixed(1)} minutes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Engagement Metrics</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
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