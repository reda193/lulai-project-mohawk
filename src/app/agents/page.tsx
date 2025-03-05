'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, PlusCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useRouter } from 'next/navigation';
import ChatbotAgentSlider from '@/components/ChatbotAgents/ChatbotAgentSlider';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface Agent {
  id: string;
  name: string;
  status: string;
  appearance?: BotAppearance | null;
}

const AgentsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAgents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/bot');
        
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        
        const data = await response.json();
        setAgents(data.bots.map((bot: any) => ({
          id: bot.id,
          name: bot.bot_name || (bot.appearance?.name || 'Unnamed Agent'),
          status: 'Active', // Always set to Active for now as requested
          appearance: bot.appearance || null
        })));
      } catch (err) {
        console.error('Error fetching agents:', err);
        setError('Failed to load your agents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAgents();
    
  }, []);

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
        p-8
      `}>
        <AgentNavigation agentId='5' />
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Your Agents</h1>
            <button
              onClick={() => router.push('/agents/new')}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              <PlusCircle className="w-5 h-5" />
              Create New Agent
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your agents...</p>
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

          {/* Empty State */}
          {!isLoading && !error && agents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="mb-4">
                <PlusCircle className="w-12 h-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No agents yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first agent</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/agents/new')}
                  className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create New Agent
                </button>
              </div>
            </div>
          )}
          {/* Agents Grid */}
          {!isLoading && !error && agents.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">All Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/agents/${agent.id}`)}
                  >
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <span className="inline-block px-2 py-1 rounded-full text-sm mt-2 bg-green-100 text-green-800">
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;