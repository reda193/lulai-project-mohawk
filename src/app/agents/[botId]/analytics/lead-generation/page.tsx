'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Target, ArrowLeft, User, DollarSign, Filter } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
import LeadGenerationChart from '@/components/BotDetails/Charts/LeadGenerationChart';

const LeadGenerationPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Get agent ID from path
  const pathname = usePathname();
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
          <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-4">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Link href={`/agents/${agentId}/analytics`} className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Lead Generation</h1>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">
                    Potential leads identified during conversations
                  </div>
                </div>
              </div>
              
              {/* Time range selector - Responsive */}
              <div className="bg-white rounded-lg shadow flex overflow-hidden self-start sm:self-center">
                {['7d', '30d', '90d'].map((range) => (
                  <button
                    key={range}
                    className={`py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-medium ${
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
            
            {/* Lead Generation Chart - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-pink-500 flex-shrink-0" />
                <span className="truncate">Lead Generation</span>
              </h2>
              <div className="w-full overflow-hidden">
                <LeadGenerationChart timeRange={timeRange} />
              </div>
            </div>
            
            {/* Lead Generation Details - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Lead Generation Insights</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Leads</h3>
                    <p className="text-base sm:text-lg font-semibold">124</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Conversion Rate</h3>
                    <p className="text-base sm:text-lg font-semibold">8.7%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Trend</h3>
                    <p className="text-base sm:text-lg font-semibold text-green-500">+12% from previous</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Recommendations to Improve Lead Generation</h3>
                  <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-xs sm:text-sm">
                    <li>Add more targeted questions to identify purchase intent</li>
                    <li>Implement nurture sequences for leads who provide contact information</li>
                    <li>Expand product-specific qualification questions</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Lead Sources - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Lead Sources</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pricing Inquiries</h3>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold">42%</p>
                    <p className="text-xs text-gray-500 mt-1">52 leads</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Product Comparisons</h3>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold">31%</p>
                    <p className="text-xs text-gray-500 mt-1">38 leads</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                      <h3 className="text-xs sm:text-sm font-medium text-gray-500 truncate">Demo Requests</h3>
                    </div>
                    <p className="text-xl sm:text-2xl font-semibold">27%</p>
                    <p className="text-xs text-gray-500 mt-1">34 leads</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Leads - Responsive */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 w-full">
              <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Recent Qualified Leads</h2>
              <div className="overflow-x-auto -mx-4 sm:-mx-0">
                <div className="inline-block min-w-full align-middle p-4 sm:p-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Source
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <span className="hidden sm:inline">Qualification</span>
                          <span className="sm:hidden">Score</span>
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-3 py-2 sm:px-6 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">
                                jane.smith@example.com
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-full">
                                ABC Company
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          Pricing Page
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">87/100</div>
                          <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 mt-1">
                            <div className="bg-green-500 h-1 sm:h-1.5 rounded-full" style={{ width: '87%' }}></div>
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          1 day ago
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            New
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 sm:h-8 sm:w-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-full">
                                michael.johnson@example.com
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-full">
                                XYZ Inc.
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          Product Demo
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">92/100</div>
                          <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5 mt-1">
                            <div className="bg-green-500 h-1 sm:h-1.5 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          2 days ago
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-right text-xs">
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Contacted
                          </span>
                        </td>
                      </tr>
                      {/* Additional rows truncated for brevity */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadGenerationPage;