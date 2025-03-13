'use client';

import { useState } from 'react';
import { MenuIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import UnrecognizedQueriesChart from '@/components/BotDetails/Charts/UnrecognizedQueriesChart';

const UnrecognizedQueriesPage = () => {
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
                  <h1 className="text-2xl font-bold text-gray-900">Unrecognized Queries</h1>
                  <div className="text-sm text-gray-500">
                    Queries that the bot failed to understand or process
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
            
            {/* Unrecognized Queries Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                Unrecognized Queries
              </h2>
              <UnrecognizedQueriesChart timeRange={timeRange} />
            </div>
            
            {/* Unrecognized Queries Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Unrecognized Query Insights</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Unrecognized Rate</h3>
                    <p className="text-lg font-semibold">12.4%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Trend</h3>
                    <p className="text-lg font-semibold text-green-500">-5.2% from previous</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-500">Top Category</h3>
                    <p className="text-lg font-semibold">Product Features</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Reduce Unrecognized Queries</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Add training examples for new product feature questions</li>
                    <li>Implement fuzzy matching for common misspellings</li>
                    <li>Create fallback responses with suggested topics</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Top Unrecognized Queries */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Top Unrecognized Queries</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Query
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Seen
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        How do I use the new reporting dashboard?
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        42
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        5 days ago
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Add to Training
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Where is the export to PDF option?
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        36
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        8 days ago
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Add to Training
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Can I integrate with Google Sheets?
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        29
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        12 days ago
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Add to Training
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        How to connect with Zapier
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        24
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        15 days ago
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Add to Training
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        Does this work with the latest iOS update?
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        21
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        18 days ago
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          Add to Training
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Query Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Query Pattern Analysis</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Common Patterns in Unrecognized Queries</h3>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>
                      <span className="font-medium">New Feature Questions (38%):</span>
                      <p className="mt-1">Queries about recently launched features or updates not yet in training data</p>
                    </li>
                    <li>
                      <span className="font-medium">Integration Requests (26%):</span>
                      <p className="mt-1">Questions about connecting with third-party tools and services</p>
                    </li>
                    <li>
                      <span className="font-medium">Complex Technical Questions (18%):</span>
                      <p className="mt-1">Advanced technical queries requiring specialized knowledge</p>
                    </li>
                    <li>
                      <span className="font-medium">Ambiguous Inputs (12%):</span>
                      <p className="mt-1">Vague queries lacking context or specific intent</p>
                    </li>
                    <li>
                      <span className="font-medium">Other (6%):</span>
                      <p className="mt-1">Miscellaneous queries not fitting other categories</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnrecognizedQueriesPage;