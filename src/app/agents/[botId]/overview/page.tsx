'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Users, MessageSquare, Calendar, Zap, Clock, Code } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  model_type?: string;
  created_at?: string;
  status: string;
  appearance?: BotAppearance | null;
}

const AgentOverviewPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agent, setAgent] = useState<Agent | null>(null);
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
      
      // Replace your current catch block with this more robust error handling
try {
  setIsLoading(true);
  console.log('Fetching agent details for ID:', agentId);
  
  const response = await fetch(`/api/bot/${agentId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch agent details. Status: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('API Response data:', data);
  
  // IMPORTANT: Extract bot data from the response
  // The API returns { bot: {...} } not just the bot object
  const botData = data.bot;
  
  if (!botData) {
    throw new Error('Bot data not found in response');
  }
  
  setAgent({
    id: botData.id,
    name: botData.bot_name || 'Unnamed Agent',
    description: botData.description,
    model_type: botData.model_type,
    created_at: botData.created_at,
    status: 'Active',
    // Check if appearance is an array and get the first item
    appearance: Array.isArray(botData.appearance) && botData.appearance.length > 0
      ? botData.appearance[0]
      : botData.appearance || null
  });
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
              <p className="text-gray-600">Loading agent details...</p>
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

          {/* Agent Details */}
          {!isLoading && !error && agent && (
            <div className="space-y-6">
              {/* Agent Header Information */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {agent.appearance?.bot_avatar ? (
                      <img 
                        src={agent.appearance.bot_avatar} 
                        alt={agent.name} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
                          }
                        }}
                      />
                    ) : (
                      <Users className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">{agent.name}</h1>
                    <p className="text-gray-600 mt-1">{agent.description || 'No description provided'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-block px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        {agent.status}
                      </span>
                      {agent.model_type && (
                        <span className="inline-block px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          {agent.model_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Conversations</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Total Users</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Created On</p>
                      <p className="text-lg font-bold">
                        {agent.created_at
                          ? new Date(agent.created_at).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Bot Configuration</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <Code className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Model Type</p>
                        <p className="font-medium">{agent.model_type || 'Standard'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <Zap className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <p className="font-medium">{agent.status}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-md">
                        <Clock className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Response Time</p>
                        <p className="font-medium">--</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deployment Info */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold mb-4">Deployment</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-dashed border-gray-300 rounded-md p-4">
                      <p className="text-gray-700 font-medium mb-2">API Endpoint</p>
                      <div className="flex items-center">
                        <code className="bg-gray-100 p-2 rounded text-sm text-gray-800 flex-1 overflow-x-auto">
                          /api/bot/{agent.id}
                        </code>
                        <button className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-700 font-medium mb-2">Embed on Website</p>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Get Embed Code
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="text-center py-8 text-gray-500">
                  <p>No recent activity to display</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentOverviewPage;