'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Users, MessageSquare, Calendar, Zap, Clock, Code, BarChart3, AlertTriangle } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { formatDistance } from 'date-fns';

// Updated interfaces to match API response
interface BotAppearance {
  bot_id: string;
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
  widget_icon?: string | null;
  widget_position?: string | null;
  input_placeholder?: string | null;
  branding_enabled?: boolean;
  widget_open_by_default?: boolean;
  starter_questions?: boolean | null;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: string;
  message_text: string;
  sent_at: string;
  response_time?: number | null;
  used_knowledge_base: boolean;
  knowledge_queries: any[];
  unrecognized_queries: any[];
}

interface Conversation {
  id: string;
  bot_id: string;
  start_time: string;
  end_time?: string | null;
  escalated: boolean;
  resolution_status?: string | null;
  minutes?: number | null;
  sentiment_score?: number | null;
  messages: Message[];
  csat: any[];
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  type: string;
  client_id: number;
  solved_by_id?: number | null;
  bot_id: string;
  created_at: string;
  updated_at: string;
  response_time?: number | null;
  resolved_at?: string | null;
  ticket_comments: any[];
  ticket_attachments: any[];
}

interface TrainingCoverage {
  id: string;
  bot_id: string;
  total_unique_queries: number;
  covered_intents: number;
  measure_at: string;
}

interface Analytics {
  conversation_count: number;
  avg_sentiment: number;
  unrecognized_queries_count: number;
  latest_coverage: TrainingCoverage | null;
}

interface Agent {
  id: string;
  bot_name: string;
  description?: string | null;
  purpose?: string | null;
  company_size?: string | null;
  company_type?: string | null;
  use_case_category?: string | null;
  use_case_description?: string | null;
  target_audience?: string | null;
  privacy_level?: string | null;
  model_type: string;
  created_at: string;
  creator_id: string;
  creator?: {
    userId: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    role: string;
  };
  appearance: BotAppearance | null;
  conversations: Conversation[];
  tickets: Ticket[];
  bot_qa: any[];
  bot_training: any[];
  training_coverage: any[];
}

interface ApiResponse {
  bot: Agent;
  analytics: Analytics;
}

const AgentOverviewPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [agentData, setAgentData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { data: session } = useSession();

  // Get agent ID from path
  const pathname = usePathname();
  const router = useRouter();

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
        
        // If the response is not OK and the user is not admin, redirect immediately
        if (!response.ok && session?.user?.role !== 'ADMIN') {
          console.log('Unauthorized access, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        const data = await response.json();
        console.log('API Response data:', data);
        
        // Set the entire response data including bot and analytics
        setAgentData(data);
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

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId, router, session]);

  // Calculate coverage percentage
  const getCoveragePercentage = () => {
    if (!agentData?.analytics?.latest_coverage) return 0;
    
    const { total_unique_queries, covered_intents } = agentData.analytics.latest_coverage;
    if (total_unique_queries === 0) return 0;
    
    return Math.round((covered_intents / total_unique_queries) * 100);
  };

  // Format the date to a readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get the time elapsed since a given date
  const getTimeElapsed = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
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
        {/* Navigation shows only on agent detail pages - pass the ID from path */}
        <AgentNavigation agentId={agentId || ''} />

        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-6 sm:py-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm sm:text-base text-gray-600">Loading agent details...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-800 p-3 sm:p-4 rounded-lg mb-4 text-sm sm:text-base">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-red-600 underline text-sm"
              >
                Try again
              </button>
            </div>
          )}

          {/* Agent Details */}
          {!isLoading && !error && agentData?.bot && (
            <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
              {/* Agent Header Information - Responsive */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mx-auto sm:mx-0 flex-shrink-0">
                    {agentData.bot.appearance?.bot_avatar ? (
                      <img 
                        src={agentData.bot.appearance.bot_avatar} 
                        alt={agentData.bot.bot_name} 
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
                      <Users className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-xl sm:text-2xl font-bold truncate">{agentData.bot.bot_name}</h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2">{agentData.bot.description || 'No description provided'}</p>
                    <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                      <span className="inline-block px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800">
                        Active
                      </span>
                      {agentData.bot.model_type && (
                        <span className="inline-block px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800">
                          {agentData.bot.model_type.replace(/_/g, ' ')}
                        </span>
                      )}
                      {agentData.bot.purpose && (
                        <span className="inline-block px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-purple-100 text-purple-800">
                          {agentData.bot.purpose}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 bg-blue-50 rounded-lg flex-shrink-0">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Total Conversations</p>
                      <p className="text-xl sm:text-2xl font-bold">{agentData.analytics.conversation_count}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 bg-green-50 rounded-lg flex-shrink-0">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Avg. Sentiment</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {agentData.analytics.avg_sentiment 
                          ? agentData.analytics.avg_sentiment.toFixed(1) 
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 md:col-span-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-3 bg-purple-50 rounded-lg flex-shrink-0">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Created On</p>
                      <p className="text-base sm:text-lg font-bold">
                        {formatDate(agentData.bot.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bot Details - Responsive */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Bot Configuration</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 rounded-md flex-shrink-0">
                        <Code className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Model Type</p>
                        <p className="text-sm sm:text-base font-medium">
                          {agentData.bot.model_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 rounded-md flex-shrink-0">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Target Audience</p>
                        <p className="text-sm sm:text-base font-medium">
                          {agentData.bot.target_audience || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 rounded-md flex-shrink-0">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Unrecognized Queries</p>
                        <p className="text-sm sm:text-base font-medium">
                          {agentData.analytics.unrecognized_queries_count}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 sm:p-2 bg-gray-100 rounded-md flex-shrink-0">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Coverage</p>
                        <p className="text-sm sm:text-base font-medium">
                          {getCoveragePercentage()}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deployment Info - Responsive */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Deployment</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="border border-dashed border-gray-300 rounded-md p-3 sm:p-4">
                      <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">API Endpoint</p>
                      <div className="flex items-center">
                        <code className="bg-gray-100 p-1.5 sm:p-2 rounded text-xs sm:text-sm text-gray-800 flex-1 overflow-x-auto">
                          /api/bot/{agentData.bot.id}
                        </code>
                        <button 
                          className="ml-2 text-blue-600 hover:text-blue-800 text-xs sm:text-sm whitespace-nowrap"
                          onClick={() => {
                            navigator.clipboard.writeText(`/api/bot/${agentData.bot.id}`);
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">Embed on Website</p>
                      <button className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Get Embed Code
                      </button>
                    </div>
                    
                    {agentData.bot.appearance && (
                      <div>
                        <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">Widget Configuration</p>
                        <div className="flex flex-wrap gap-2">
                          {agentData.bot.appearance.widget_position && (
                            <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs">
                              Position: {agentData.bot.appearance.widget_position}
                            </span>
                          )}
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs">
                            Branding: {agentData.bot.appearance.branding_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-xs">
                            Auto-open: {agentData.bot.appearance.widget_open_by_default ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity - Responsive */}
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Recent Activity</h2>
                
                {agentData.bot.conversations && agentData.bot.conversations.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {agentData.bot.conversations.slice(0, 5).map((conversation) => (
                      <div key={conversation.id} className="py-3 sm:py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm sm:text-base font-medium">
                              Conversation #{conversation.id.substring(0, 8)}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500">
                              Started {getTimeElapsed(conversation.start_time)}
                              {conversation.end_time && ` • Ended ${getTimeElapsed(conversation.end_time)}`}
                            </p>
                            {conversation.messages.length > 0 && (
                              <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-1">
                                Last message: "{conversation.messages[0].message_text}"
                              </p>
                            )}
                          </div>
                          <div className="flex items-center">
                            {conversation.sentiment_score !== null && conversation.sentiment_score !== undefined && (
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                conversation.sentiment_score > 0.6 
                                  ? 'bg-green-100 text-green-800' 
                                  : conversation.sentiment_score < 0.4 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {conversation.sentiment_score > 0.6 
                                  ? 'Positive' 
                                  : conversation.sentiment_score < 0.4 
                                    ? 'Negative' 
                                    : 'Neutral'}
                              </span>
                            )}
                            {conversation.escalated && (
                              <span className="ml-2 inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">
                                Escalated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
                    <p>No recent activity to display</p>
                  </div>
                )}
                
                {/* Recent Tickets */}
                {agentData.bot.tickets && agentData.bot.tickets.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3">Recent Tickets</h3>
                    <div className="divide-y divide-gray-200">
                      {agentData.bot.tickets.map((ticket) => (
                        <div key={ticket.id} className="py-3 sm:py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm sm:text-base font-medium">{ticket.title}</p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Created {getTimeElapsed(ticket.created_at)} • 
                                <span className={`ml-1 ${
                                  ticket.status === 'OPEN' 
                                    ? 'text-red-600' 
                                    : ticket.status === 'RESOLVED' 
                                      ? 'text-green-600' 
                                      : 'text-blue-600'
                                }`}>
                                  {ticket.status.replace(/_/g, ' ')}
                                </span>
                              </p>
                              <p className="text-xs sm:text-sm text-gray-700 mt-1 line-clamp-1">
                                {ticket.description}
                              </p>
                            </div>
                            <div>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${
                                ticket.priority === 'HIGH' || ticket.priority === 'URGENT'
                                  ? 'bg-red-100 text-red-800' 
                                  : ticket.priority === 'MEDIUM' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentOverviewPage;