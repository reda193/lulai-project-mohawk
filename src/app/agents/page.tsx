// app/agents/page.tsx
'use client';

import { useState } from 'react';
import { MenuIcon, PlusCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useRouter } from 'next/navigation';

const AgentsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const router = useRouter();

  // Example agents data - would come from API
  const agents = [
    { id: 1, name: 'Shopify', status: 'Active' },
    { id: 2, name: 'Testing', status: 'Active' },
    // ... more agents
  ];

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

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div 
                key={agent.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/agents/${agent.id}`)}
              >
                <h3 className="font-semibold text-lg">{agent.name}</h3>
                <span className={`
                  inline-block px-2 py-1 rounded-full text-sm
                  ${agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                `}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;