'use client';

import { useState } from 'react';
import { MenuIcon, Clock, ArrowLeft, Zap, AlertTriangle, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import ResponseTimeChart from '@/components/BotDetails/Charts/ResponseTimeChart';

const ResponseTimePage = () => {
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
                  <h1 className="text-2xl font-bold text-gray-900">Average Response Time</h1>
                  <div className="text-sm text-gray-500">
                    Average time taken for the bot to respond to user queries
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
            
            {/* Response Time Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                Average Response Time
              </h2>
              <ResponseTimeChart timeRange={timeRange} />
            </div>
            
            {/* Response Time Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Response Time Analysis</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <h3 className="text-sm font-medium text-gray-500">Average Response Time</h3>
                    </div>
                    <p className="text-lg font-semibold">1.8 seconds</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500">↓ 0.5s</span> from previous
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-green-500" />
                      <h3 className="text-sm font-medium text-gray-500">Fastest Response</h3>
                    </div>
                    <p className="text-lg font-semibold">0.6 seconds</p>
                    <p className="text-xs text-gray-500 mt-1">Simple queries</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <h3 className="text-sm font-medium text-gray-500">Slowest Response</h3>
                    </div>
                    <p className="text-lg font-semibold">4.2 seconds</p>
                    <p className="text-xs text-gray-500 mt-1">Complex technical queries</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Response Time</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Optimize knowledge base retrieval for complex queries</li>
                    <li>Pre-cache common responses for frequently asked questions</li>
                    <li>Implement progressive responses for queries requiring longer processing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Response Time by Query Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Response Time by Query Type</h2>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Query Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Average Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          90th Percentile
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Simple FAQs
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          532
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          0.8s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1.2s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                          ↓ 0.2s
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Account Questions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          487
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1.2s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1.8s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                          ↓ 0.3s
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Product Questions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          412
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          1.5s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2.3s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                          ↓ 0.4s
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Technical Support
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          278
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          2.7s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          3.8s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">
                          ↓ 0.6s
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          API & Integration
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          195
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          3.2s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          4.1s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">
                          ↓ 0.2s
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Performance Factors */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Response Time Factors</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Query Complexity Impact</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Simple queries</span>
                          <span className="text-xs font-medium text-gray-700">0.8s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Medium complexity</span>
                          <span className="text-xs font-medium text-gray-700">1.6s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Complex queries</span>
                          <span className="text-xs font-medium text-gray-700">2.8s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Knowledge-intensive</span>
                          <span className="text-xs font-medium text-gray-700">3.5s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '87.5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Traffic Load Impact</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Low traffic (off-hours)</span>
                          <span className="text-xs font-medium text-gray-700">1.5s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '37.5%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Normal traffic</span>
                          <span className="text-xs font-medium text-gray-700">1.8s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">Peak hours</span>
                          <span className="text-xs font-medium text-gray-700">2.1s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '52.5%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-500">High traffic events</span>
                          <span className="text-xs font-medium text-gray-700">2.6s avg</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Peak Traffic Hours</h3>
                  <div className="flex items-center space-x-2 overflow-x-auto py-2">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col items-center min-w-[32px]"
                      >
                        <div className="text-xs text-gray-500 mb-1">{i}h</div>
                        <div 
                          className={`w-6 ${
                            // Simulate a typical workday traffic pattern
                            i >= 9 && i <= 17 
                              ? (i >= 10 && i <= 15 ? 'bg-red-500' : 'bg-orange-400')
                              : (i >= 6 && i <= 20 ? 'bg-blue-400' : 'bg-green-400')
                          } rounded-t-sm`}
                          style={{ 
                            height: `${
                              // Simulate traffic pattern heights
                              i >= 10 && i <= 15 
                                ? 40 + Math.sin((i - 10) * 0.5) * 30 
                                : i >= 6 && i <= 20 
                                  ? 20 + i * 0.8
                                  : 10
                            }px` 
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-3 text-xs text-gray-500">
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                      <span>High Load</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-orange-400 mr-1"></div>
                      <span>Medium Load</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <div className="w-3 h-3 rounded-full bg-blue-400 mr-1"></div>
                      <span>Normal Load</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-1"></div>
                      <span>Low Load</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseTimePage;