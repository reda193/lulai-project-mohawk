'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Search, MessageSquare, User, Filter, ChevronDown, MoreHorizontal, 
  Download, AlertCircle, CheckCircle, Clock, Flag } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  user: {
    name: string;
    id: string;
    avatar?: string;
  };
  lastMessage: {
    text: string;
    timestamp: Date;
  };
  status: 'active' | 'resolved' | 'pending' | 'escalated';
  unread?: boolean;
  messages?: Message[];
}

const AgentConversationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchInputValue, setSearchInputValue] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  
  // Get agent ID from path
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: Date | string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const date = new Date(timestamp);
    
    if (date >= today) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date >= yesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Fetch initial data: bot details and conversation list
  useEffect(() => {
    const fetchData = async () => {
      if (!agentId) {
        setError('No agent ID found in URL');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch bot details
        const botResponse = await fetch(`/api/bot/${agentId}`);
        
        // If the response is not OK and the user is not admin, redirect immediately
        if (!botResponse.ok && session?.user?.role !== 'ADMIN') {
          console.log('Unauthorized access, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        if (!botResponse.ok) {
          throw new Error(`Failed to fetch agent details. Status: ${botResponse.status}`);
        }
        
        const botData = await botResponse.json();
        
        if (!botData.bot) {
          throw new Error('Bot data not found in response');
        }
        
        setAgent({
          id: botData.bot.id,
          name: botData.bot.bot_name || 'Unnamed Agent',
          appearance: Array.isArray(botData.bot.appearance) && botData.bot.appearance.length > 0
            ? botData.bot.appearance[0]
            : botData.bot.appearance || null
        });
        
        // Fetch conversations
        await fetchConversations();
      } catch (error: any) {
        console.error('Error fetching data:', error);
        
        // Redirect non-admin users when there's an error
        if (session?.user?.role !== 'ADMIN') {
          console.log('Error occurred, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
        
        setError(typeof error === 'string' ? error : error.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchData();
    }
  }, [agentId, router, session]);

  // Fetch conversations list
  const fetchConversations = async () => {
    if (!agentId) return;
    
    try {
      // Build URL with filters
      let url = `/api/bot/${agentId}/conversations`;
      const params = new URLSearchParams();
      
      if (activeFilter !== 'all') {
        params.append('status', activeFilter);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching conversations from URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received conversations data:', data);
      
      // If there are no conversations in the API response, initialize with an empty array
      const conversationsData = data.conversations || [];
      setConversations(conversationsData);
      
      // If we have conversations and none is selected, select the first one
      if (conversationsData.length > 0 && !selectedConversation) {
        fetchConversationDetail(conversationsData[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      // Don't set the main error state here to avoid disrupting the UI if just the list fails
    }
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInputValue);
  };

  // Filter and search effect
  useEffect(() => {
    if (!isLoading) {
      fetchConversations();
    }
  }, [activeFilter, searchQuery]);

  // Fetch conversation detail
  const fetchConversationDetail = async (conversationId: string) => {
    if (!agentId) return;
    
    setIsLoadingConversation(true);
    
    try {
      console.log(`Fetching conversation details for ID: ${conversationId}`);
      const url = `/api/bot/${agentId}/conversations/${conversationId}`;
      console.log('URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation details. Status: ${response.status}`);
      }
      
      const conversationData = await response.json();
      console.log('Conversation detail data:', conversationData);
      
      // Update the selected conversation with full details
      setSelectedConversation(conversationData);
    } catch (error: any) {
      console.error('Error fetching conversation details:', error);
      alert(`Error loading conversation: ${error.message}`);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!replyText.trim() || !selectedConversation || !agentId) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch(`/api/bot/${agentId}/conversations/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: replyText }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message. Status: ${response.status}`);
      }
      
      const messageData = await response.json();
      
      // Add the new message to the conversation
      if (selectedConversation.messages) {
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, {
            id: messageData.id,
            sender: messageData.sender,
            text: messageData.text,
            timestamp: new Date(messageData.timestamp)
          }],
          lastMessage: {
            text: messageData.text,
            timestamp: new Date(messageData.timestamp)
          }
        };
        
        setSelectedConversation(updatedConversation);
        
        // Also update this conversation in the list
        setConversations(conversations.map(conv => 
          conv.id === selectedConversation.id 
            ? {
                ...conv,
                lastMessage: {
                  text: messageData.text,
                  timestamp: new Date(messageData.timestamp)
                }
              } 
            : conv
        ));
      }
      
      // Clear the reply text
      setReplyText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Update conversation status
  const updateConversationStatus = async (conversationId: string, newStatus: string) => {
    if (!agentId) return;
    
    try {
      const response = await fetch(`/api/bot/${agentId}/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update status. Status: ${response.status}`);
      }
      
      // Update local state
      if (selectedConversation && selectedConversation.id === conversationId) {
        setSelectedConversation({
          ...selectedConversation,
          status: newStatus as any
        });
      }
      
      setConversations(conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, status: newStatus as any } 
          : conv
      ));
      
      // If the active filter is not 'all' and we just changed the status,
      // we should refresh the conversation list to reflect the change
      if (activeFilter !== 'all') {
        fetchConversations();
      }
    } catch (error: any) {
      console.error('Error updating conversation status:', error);
      alert('Failed to update conversation status. Please try again.');
    }
  };

  // Get status icon based on conversation status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'escalated':
        return <Flag className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    if (selectedConversation?.id === conversation.id) return;
    fetchConversationDetail(conversation.id);
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
      `}>
        {/* Navigation shows only on agent detail pages - pass the ID from path */}
        <div className="">
          <AgentNavigation agentId={agentId || ''} />
        </div>

        <div className="max-w-7xl mx-auto px-8">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading conversations...</p>
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

          {/* Conversations Interface */}
          {!isLoading && !error && agent && (
            <div className="bg-white rounded-lg shadow overflow-hidden flex h-[calc(100vh-10rem)]">
              {/* Conversation List Sidebar */}
              <div className="w-80 border-r border-gray-200 flex flex-col">
                {/* Search and Filter Header */}
                <div className="p-4 border-b border-gray-200">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <button type="submit" className="sr-only">Search</button>
                    </div>
                  </form>
                  
                  <div className="flex mt-3 gap-2">
                    <button
                      className={`text-xs px-3 py-1 rounded-full ${
                        activeFilter === 'all' 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveFilter('all')}
                    >
                      All
                    </button>
                    <button
                      className={`text-xs px-3 py-1 rounded-full ${
                        activeFilter === 'active' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveFilter('active')}
                    >
                      Active
                    </button>
                    <button
                      className={`text-xs px-3 py-1 rounded-full ${
                        activeFilter === 'resolved' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setActiveFilter('resolved')}
                    >
                      Resolved
                    </button>
                    <div className="relative">
                      <button
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1 rounded-full flex items-center"
                        onClick={() => {
                          const dropdown = document.getElementById('filterDropdown');
                          if (dropdown) {
                            dropdown.classList.toggle('hidden');
                          }
                        }}
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                      
                      {/* Filter dropdown */}
                      <div 
                        id="filterDropdown"
                        className="absolute left-0 mt-2 w-36 bg-white rounded-md shadow-lg z-10 hidden"
                      >
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setActiveFilter('pending');
                              document.getElementById('filterDropdown')?.classList.add('hidden');
                            }}
                          >
                            <span className="flex items-center">
                              <AlertCircle className="w-3 h-3 text-yellow-500 mr-2" />
                              Pending
                            </span>
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setActiveFilter('escalated');
                              document.getElementById('filterDropdown')?.classList.add('hidden');
                            }}
                          >
                            <span className="flex items-center">
                              <Flag className="w-3 h-3 text-red-500 mr-2" />
                              Escalated
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                            {conv.user.avatar ? (
                              <img src={conv.user.avatar} alt={conv.user.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-gray-900 truncate">{conv.user.name}</p>
                              <span className="text-xs text-gray-500">{formatTimestamp(conv.lastMessage.timestamp)}</span>
                            </div>
                            <div className="flex items-center mt-1">
                              {getStatusIcon(conv.status)}
                              <p className="text-sm text-gray-600 truncate ml-1">
                                {conv.lastMessage.text}
                              </p>
                            </div>
                          </div>
                          {conv.unread && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Conversation Detail */}
              <div className="flex-1 flex flex-col">
                {isLoadingConversation ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading conversation...</p>
                  </div>
                ) : selectedConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {selectedConversation.user.avatar ? (
                            <img 
                              src={selectedConversation.user.avatar} 
                              alt={selectedConversation.user.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{selectedConversation.user.name}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            {getStatusIcon(selectedConversation.status)}
                            <span className="ml-1 capitalize">{selectedConversation.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <button 
                            className="p-2 rounded-full hover:bg-gray-100 flex items-center"
                            onClick={() => {
                              // Simple dropdown toggle implementation
                              const dropdown = document.getElementById('statusDropdown');
                              if (dropdown) {
                                dropdown.classList.toggle('hidden');
                              }
                            }}
                          >
                            <span className="mr-1 text-sm">Change Status</span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                          
                          {/* Status dropdown */}
                          <div 
                            id="statusDropdown"
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden"
                          >
                            <div className="py-1">
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  updateConversationStatus(selectedConversation.id, 'active');
                                  document.getElementById('statusDropdown')?.classList.add('hidden');
                                }}
                              >
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 text-blue-500 mr-2" />
                                  Active
                                </span>
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  updateConversationStatus(selectedConversation.id, 'resolved');
                                  document.getElementById('statusDropdown')?.classList.add('hidden');
                                }}
                              >
                                <span className="flex items-center">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  Resolved
                                </span>
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  updateConversationStatus(selectedConversation.id, 'pending');
                                  document.getElementById('statusDropdown')?.classList.add('hidden');
                                }}
                              >
                                <span className="flex items-center">
                                  <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                                  Pending
                                </span>
                              </button>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => {
                                  updateConversationStatus(selectedConversation.id, 'escalated');
                                  document.getElementById('statusDropdown')?.classList.add('hidden');
                                }}
                              >
                                <span className="flex items-center">
                                  <Flag className="w-4 h-4 text-red-500 mr-2" />
                                  Escalated
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Download className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedConversation.messages?.length ? (
                        selectedConversation.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`flex ${message.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'user' 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              <p>{message.text}</p>
                              <div 
                                className={`text-xs mt-1 ${
                                  message.sender === 'user' ? 'text-gray-500' : 'text-blue-200'
                                }`}
                              >
                                {formatTimestamp(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <p className="text-gray-500">No messages in this conversation</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Reply Box */}
                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-end space-x-3">
                        <div className="flex-1">
                          <textarea
                            placeholder="Type your message..."
                            className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isSending}
                          ></textarea>
                        </div>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg h-10 flex items-center justify-center disabled:opacity-50"
                          onClick={handleSendMessage}
                          disabled={!replyText.trim() || isSending}
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-lg">No conversation selected</p>
                    <p className="text-gray-400 mt-1">Select a conversation from the list</p>
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

export default AgentConversationsPage;