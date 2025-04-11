'use client';

import { useState, useEffect } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import BotDetailsDashboard from '@/components/BotDetails/BotDetailsDashboard';

// Create a cache object outside component to persist data between renders
const dataCache = {
  botData: new Map(),
};

const AgentAnalyticsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [botData, setBotData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  
  // Get agent ID from path
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
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

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) {
        setError('No agent ID found in URL');
        setIsLoading(false);
        return;
      }
      
      // Check if we already have data for this agent ID in our cache
      if (dataCache.botData.has(agentId)) {
        console.log('Using cached data for agent ID:', agentId);
        setBotData(dataCache.botData.get(agentId));
        setIsLoading(false);
        setDataFetched(true);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching agent details for ID:', agentId);
        
        const response = await fetch(`/api/bot/${agentId}`);
        
        // If the response is not OK and the user is not admin, redirect immediately
        if (!response.ok && session?.user?.role !== 'ADMIN') {
          console.log('Unauthorized access, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Extract bot data from the response
        const botData = data.bot;
        
        if (!botData) {
          throw new Error('Bot data not found in response');
        }
        
        // Format the data to match what BotDetailsDashboard expects
        const formattedBotData = {
          id: botData.id,
          name: botData.bot_name || 'Unnamed Agent',
          description: botData.description || null,
          model_type: botData.model_type,
          // Convert string date to Date object
          created_at: new Date(botData.created_at),
          appearance: Array.isArray(botData.appearance) && botData.appearance.length > 0
            ? botData.appearance[0]
            : botData.appearance || null
        };
        
        // Store in cache for future use
        dataCache.botData.set(agentId, formattedBotData);
        
        setBotData(formattedBotData);
        setDataFetched(true);
      } catch (error: unknown) {
        console.error('Error fetching agent details:', error);
        
        // Redirect non-admin users when there's an error
        if (session?.user?.role !== 'ADMIN') {
          console.log('Error occurred, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        // Properly handle different error types
        let errorMessage = 'Failed to load agent details';
        
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage += `: ${error}`;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage += `: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId && !dataFetched) {
      fetchAgentDetails();
    }
  }, [agentId, router, session, dataFetched]);

  // Close sidebar when clicking overlay on mobile
  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Force refresh data - used for manual refresh button
  const handleForceRefresh = async () => {
    if (agentId) {
      // Clear cached data for this ID
      dataCache.botData.delete(agentId);
      setDataFetched(false);
      setIsLoading(true);
      setError(null);
    }
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
        {/* Navigation - pass the ID from path */}
        <AgentNavigation agentId={agentId || ''} />

        {/* Content area */}
        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4">
              <p>{error}</p>
              <button 
                onClick={handleForceRefresh} 
                className="mt-2 text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* BotDetailsDashboard Component */}
          {!isLoading && !error && botData && (
            <div className="pb-10 w-full">
              <div className="flex justify-end mb-2 sm:mb-4">
                <button
                  onClick={handleForceRefresh}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh data
                </button>
              </div>
              <div className="w-full">
                <BotDetailsDashboard bot={botData} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentAnalyticsPage;