// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { ChatbotAgent, Customer } from '@/types/dashboard';

// Import components
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentCard from '@/components/ChatbotAgents/AgentCard';
import VisitorsMap from '@/components/Analytics/VisitorsMap';
import RepliesChart from '@/components/Analytics/RepliesChart';
import CustomerTable from '@/components/Customers/CustomerTable';
import CreateAgentButton from '@/components/CreateAgent/CreateAgentButton';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // This would come from API
  const chatbotAgents: ChatbotAgent[] = [
    { name: 'Shopify', status: 'Active' },
    { name: 'Testing', status: 'Active' },
    { name: 'Shopify GA', status: 'Active' },
  ];

  // This would come from API
  const topCustomers: Customer[] = [
    { name: 'John Doe', total: '$8,000.00', country: 'USA', date: '2023-10-15', status: 'Active' },
    { name: 'Jane Smith', total: '$5,000.00', country: 'Canada', date: '2023-10-15', status: 'Pending' },
    { name: 'Michael Johnson', total: '$4,000.00', country: 'UK', date: '2023-10-15', status: 'Pending' },
    { name: 'Emily Brown', total: '$3,500.00', country: 'Australia', date: '2023-10-15', status: 'Active' },
    { name: 'David Wilson', total: '$3,000.00', country: 'Germany', date: '2023-10-15', status: 'Active' },
  ];

  // Handler for creating new agent
  const handleCreateAgent = () => {
    console.log('Creating new agent...');
    // Implementation for creating new agent would go here
  };

  // Handler for agent card click
  const handleAgentClick = (agent: ChatbotAgent) => {
    console.log('Agent clicked:', agent.name);
    // Implementation for handling agent click would go here
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
        p-8
      `}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            </div>
          </header>

          {/* Create New Agent Section */}
          <div className="bg-gray-100 p-4 rounded-lg mb-8">
            <CreateAgentButton onClick={handleCreateAgent} />
          </div>

          {/* Chatbot Agents */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Chatbot Agents Deployed
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {chatbotAgents.map((agent, index) => (
                <AgentCard 
                  key={index}
                  name={agent.name}
                  status={agent.status}
                  onClick={() => handleAgentClick(agent)}
                />
              ))}
            </div>
          </section>

          {/* Quick Analytics */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Quick Analytics
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <VisitorsMap data={[]} /> {/* Would pass actual visitor data from API */}
              <RepliesChart data={[]} /> {/* Would pass actual reply data from API */}
            </div>
          </section>

          {/* Top Customers */}
          <section className="mb-8">
            <CustomerTable customers={topCustomers} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;