'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Users, MessageSquare, Calendar, Zap, Clock, Code, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface Owner {
  userId: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface Agent {
  id: string;
  name: string;
  description?: string | null;
  model_type?: string;
  created_at?: string;
  status: string;
  appearance?: BotAppearance | null;
  creator?: Owner | null;
}

const AgentDetailsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const agentId = params?.botId as string;

  // Check if user is admin for showing the banner only
  const isAdmin = session?.user?.role === 'ADMIN';
  const isAdminPath = pathname?.includes('/admin/');
  
  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bot/${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent details: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract the bot data - could be either directly in data or in data.bot
        const botData = data.bot || data;
        
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
          appearance: botData.appearance?.[0] || null,
          creator: botData.creator || null
        });
      } catch (err) {
        console.error('Error fetching agent details:', err);
        setError('Failed to load agent details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  // Admin banner component - only shown when admin accessing from admin path
  const AdminViewBanner = () => {
    if (!(isAdmin && isAdminPath) || !agent?.creator) return null;
    
    const ownerName = agent.creator.first_name && agent.creator.last_name
      ? `${agent.creator.first_name} ${agent.creator.last_name}`.trim()
      : agent.creator.email;
      
    return (
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-800">
              Admin View Mode: Viewing bot owned by {ownerName}
            </p>
            <p className="text-sm text-amber-700">
              Owner Email: {agent.creator.email} {agent.creator.userId ? `| Owner ID: ${agent.creator.userId}` : ''}
            </p>
          </div>
          
          <Link 
            href="/admin/client-management"
            className="inline-flex items-center px-4 py-2 bg-white border border-amber-500 text-amber-700 rounded-md hover:bg-amber-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Client Management
          </Link>
        </div>
      </div>
    );
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
        {/* Page Title */}
        <h1 className="text-xl font-semibold py-4 px-8 border-b border-gray-200">Agent Details</h1>
        
        {/* Agent Navigation - Now spans full width */}
        <AgentNavigation agentId={agentId} />

        {/* Content Area */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Admin View Banner */}
            <AdminViewBanner />

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
                            /api/agents/{agent.id}
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
    </div>
  );
};

export default AgentDetailsPage;