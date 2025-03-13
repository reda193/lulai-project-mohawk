'use client';

import { useState, useEffect } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import BotDetailsDashboard from '@/components/BotDetails/BotDetailsDashboard';

const AgentAnalyticsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [botData, setBotData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) {
        setError('No agent ID found in URL');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching agent details for ID:', agentId);
        
        const response = await fetch(`/api/bot/${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent details. Status: ${response.status}`);
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
        
        setBotData(formattedBotData);
      } catch (error: unknown) {
        console.error('Error fetching agent details:', error);
        
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

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

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

        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* BotDetailsDashboard Component */}
          {!isLoading && !error && botData && (
            <BotDetailsDashboard bot={botData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentAnalyticsPage;