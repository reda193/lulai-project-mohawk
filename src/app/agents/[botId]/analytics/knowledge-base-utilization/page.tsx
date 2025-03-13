'use client';

import { useState } from 'react';
import { MenuIcon, Database, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import KnowledgeBaseChart from '@/components/BotDetails/Charts/KnowledgeBaseChart';

const KnowledgeBasePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

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
                  <h1 className="text-2xl font-bold text-gray-900">Knowledge Base Utilization</h1>
                  <div className="text-sm text-gray-500">
                    How effectively your bot leverages knowledge base content
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
            
            {/* Knowledge Base Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-500" />
                Knowledge Base Utilization
              </h2>
              <KnowledgeBaseChart timeRange={timeRange} />
            </div>
            
            {/* Knowledge Base Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Knowledge Base Insights</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Top Utilized Article</h3>
                    <p className="text-lg font-semibold">Account Settings</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Knowledge Coverage</h3>
                    <p className="text-lg font-semibold">78%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Low Usage Categories</h3>
                    <p className="text-lg font-semibold">Technical Setup</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Knowledge Base</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Add more detailed content for Technical Setup section</li>
                    <li>Update pricing information which is referenced frequently</li>
                    <li>Create new articles for the top 5 unresolved queries</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Top Articles Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Top Referenced Articles</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Article
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        References
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Resolution Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        How to Change Account Settings
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Account Management
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        487
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        92%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Subscription Plan Comparison
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Billing
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        356
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        88%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Password Reset Instructions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Security
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        298
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        95%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Data Export Guide
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Data Management
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        245
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        82%
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        API Integration Steps
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Technical Setup
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        187
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        74%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;