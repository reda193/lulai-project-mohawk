'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Search, Filter, User, ChevronRight, Star, Circle, Clock, MessageCircle, PlusCircle, ArrowDown } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSession } from 'next-auth/react';

// Mock message data
const MOCK_MESSAGES = [
  {
    id: 1,
    sender: 'Jane Cooper',
    avatar: null,
    subject: 'Question about bot integration',
    preview: 'Hi there, I was wondering if your platform supports integration with Slack and MS Teams?',
    time: '09:45 AM',
    date: 'Today',
    read: false,
    starred: true,
    category: 'support'
  },
  {
    id: 2,
    sender: 'Robert Johnson',
    avatar: null,
    subject: 'API Documentation',
    preview: 'Thank you for sending over the API docs. I have a few questions regarding the rate limiting...',
    time: 'Yesterday',
    date: 'May 10, 2023',
    read: true,
    starred: false,
    category: 'technical'
  },
  {
    id: 3,
    sender: 'Sarah Williams',
    avatar: null,
    subject: 'Billing inquiry',
    preview: 'I noticed a discrepancy in my latest invoice. The amount charged doesn\'t match my plan...',
    time: '2 days ago',
    date: 'May 9, 2023',
    read: true,
    starred: false,
    category: 'billing'
  },
  {
    id: 4,
    sender: 'Michael Brown',
    avatar: null,
    subject: 'Feature request: Custom integrations',
    preview: 'We would love to see more customization options for the bot responses, especially when...',
    time: '3 days ago',
    date: 'May 8, 2023',
    read: true,
    starred: true,
    category: 'feature'
  },
  {
    id: 5,
    sender: 'Emily Davis',
    avatar: null,
    subject: 'Account access issues',
    preview: 'I\'m having trouble accessing my dashboard. Every time I try to log in, I get an error...',
    time: '5 days ago',
    date: 'May 6, 2023',
    read: false,
    starred: false,
    category: 'support'
  },
  {
    id: 6,
    sender: 'David Wilson',
    avatar: null,
    subject: 'Bot training questions',
    preview: 'How many sample questions do you recommend for properly training the AI to understand industry-specific terminology?',
    time: '1 week ago',
    date: 'May 3, 2023',
    read: true,
    starred: false,
    category: 'technical'
  }
];

const MessagesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: session } = useSession();

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

  // Filter messages based on search and category
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchQuery.trim() === '' || 
      message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || message.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Toggle star on a message
  const toggleStar = (id: number) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, starred: !message.starred } : message
    ));
  };

  // Mark message as read
  const markAsRead = (id: number) => {
    setMessages(messages.map(message => 
      message.id === id ? { ...message, read: true } : message
    ));
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
        <div className="w-full px-2 sm:px-4 lg:px-6 mx-auto py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100">
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
              
              <button className="hidden sm:flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <PlusCircle className="h-4 w-4" />
                <span>New Message</span>
              </button>
              
              <button className="sm:hidden p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Categories */}
          <div className="mb-6 overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 min-w-max">
              <button 
                className={`px-4 py-2 rounded-md ${selectedCategory === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory(null)}
              >
                All Messages
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${selectedCategory === 'support' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory('support')}
              >
                Support
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${selectedCategory === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory('technical')}
              >
                Technical
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${selectedCategory === 'billing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory('billing')}
              >
                Billing
              </button>
              <button 
                className={`px-4 py-2 rounded-md ${selectedCategory === 'feature' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory('feature')}
              >
                Feature Requests
              </button>
            </div>
          </div>
          
          {/* Message List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filteredMessages.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredMessages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(message.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {message.avatar ? (
                          <img src={message.avatar} alt={message.sender} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={`font-semibold text-sm sm:text-base truncate ${!message.read ? 'text-black' : 'text-gray-700'}`}>
                            {message.sender}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(message.id);
                              }}
                              className="p-1 hover:bg-gray-200 rounded-full"
                            >
                              <Star className={`w-4 h-4 ${message.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                            </button>
                            <span className="text-xs text-gray-500 whitespace-nowrap">{message.time}</span>
                          </div>
                        </div>
                        
                        <p className={`font-medium text-sm mb-1 ${!message.read ? 'text-black' : 'text-gray-700'}`}>
                          {message.subject}
                        </p>
                        
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                          {message.preview}
                        </p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {!message.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <span className={`text-xs ${!message.read ? 'text-blue-600' : 'text-gray-500'}`}>
                              {message.category.charAt(0).toUpperCase() + message.category.slice(1)}
                            </span>
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No messages found</h3>
                <p className="text-gray-500 mb-4">No messages match your current filters</p>
                <button 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  <ArrowDown className="w-4 h-4" />
                  <span>Reset filters</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredMessages.length > 0 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredMessages.length}</span> of <span className="font-medium">{messages.length}</span> messages
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400" disabled>
                  Previous
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400" disabled>
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;