'use client';

import { useState } from 'react';
import { MenuIcon, TrendingUp, ArrowLeft, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import SentimentTrendsChart from '@/components/BotDetails/Charts/SentimentTrendsChart';

const SentimentTrendsPage = () => {
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
                  <h1 className="text-2xl font-bold text-gray-900">Sentiment Trends</h1>
                  <div className="text-sm text-gray-500">
                    Analysis of user sentiment throughout conversations
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
            
            {/* Sentiment Trends Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Sentiment Trends
              </h2>
              <SentimentTrendsChart timeRange={timeRange} />
            </div>
            
            {/* Sentiment Trends Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Sentiment Analysis</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      <h3 className="text-sm font-medium text-gray-500">Positive Sentiment</h3>
                    </div>
                    <p className="text-lg font-semibold">68%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-green-500">↑ 8%</span> from previous
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <h3 className="text-sm font-medium text-gray-500">Neutral Sentiment</h3>
                    </div>
                    <p className="text-lg font-semibold">24%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-red-500">↓ 5%</span> from previous
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <h3 className="text-sm font-medium text-gray-500">Negative Sentiment</h3>
                    </div>
                    <p className="text-lg font-semibold">8%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="text-red-500">↓ 3%</span> from previous
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Sentiment</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Address known pain points in billing-related conversations</li>
                    <li>Improve handling of complex technical questions with more detailed responses</li>
                    <li>Add more empathetic responses for error scenarios</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Sentiment by Topic */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Sentiment by Topic</h2>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Positive
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Neutral
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Negative
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Account Management
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          485
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-600 font-medium">78%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 font-medium">18%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '18%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-600 font-medium">4%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '4%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Billing & Payments
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          372
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-600 font-medium">58%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 font-medium">27%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '27%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-600 font-medium">15%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Product Features
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          418
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-600 font-medium">72%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 font-medium">22%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '22%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-600 font-medium">6%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '6%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Technical Support
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          287
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-600 font-medium">62%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '62%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 font-medium">26%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '26%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-600 font-medium">12%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          API & Integrations
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          195
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-green-600 font-medium">64%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '64%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-gray-600 font-medium">26%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '26%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm text-red-600 font-medium">10%</div>
                            <div className="w-16 bg-gray-200 h-1.5 ml-2 rounded-full">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Sentiment Progression */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium mb-4">Sentiment Progression During Conversations</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Analysis of how sentiment changes throughout conversation stages shows that sentiment typically 
                    improves from initial interaction to resolution, with notable variations by topic.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Start of Conversation</span>
                        <span className="text-sm font-medium">End of Conversation</span>
                      </div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div style={{ width: "52%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          <div style={{ width: "36%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
                          <div style={{ width: "12%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>52% Positive</span>
                          <span>36% Neutral</span>
                          <span>12% Negative</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div style={{ width: "68%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          <div style={{ width: "24%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gray-500"></div>
                          <div style={{ width: "8%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>68% Positive</span>
                          <span>24% Neutral</span>
                          <span>8% Negative</span>
                        </div>
                      </div>
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

export default SentimentTrendsPage;