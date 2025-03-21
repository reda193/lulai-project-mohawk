'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Search, MessageSquare, User, Filter, ChevronDown, MoreHorizontal, 
  Download, AlertCircle, CheckCircle, Clock, Flag } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';
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
  messages: Message[];
}

const AgentConversationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: Date) => {
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

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) {
        setError('No agent ID found in URL');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/bot/${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent details. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const botData = data.bot;
        
        if (!botData) {
          throw new Error('Bot data not found in response');
        }
        
        setAgent({
          id: botData.id,
          name: botData.bot_name || 'Unnamed Agent',
          appearance: Array.isArray(botData.appearance) && botData.appearance.length > 0
            ? botData.appearance[0]
            : botData.appearance || null
        });
        
        // Mock conversations data - in a real app, this would be fetched from an API
        const mockConversations = generateMockConversations();
        setConversations(mockConversations);
        
        if (mockConversations.length > 0) {
          setSelectedConversation(mockConversations[0]);
        }
      } catch (error: unknown) {
        console.error('Error fetching agent details:', error);
        
        let errorMessage = 'Failed to load agent details';
        
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage += `: ${error}`;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage += `: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  // Generate mock conversation data
  const generateMockConversations = (): Conversation[] => {
    const now = new Date();
    const userNames = ['John Doe', 'Sarah Smith', 'Mike Johnson', 'Emma Wilson', 'Alex Chen', 'Taylor Brown', 'Jordan Lee'];
    const statusOptions = ['active', 'resolved', 'pending', 'escalated'];
    const randomTexts = [
      "Hi, I need help with my account",
      "Can you tell me about your pricing?",
      "I'm having trouble with your product",
      "How do I reset my password?",
      "Do you offer enterprise plans?",
      "When will the new features be released?",
      "I think I found a bug in your app"
    ];
    
    return Array.from({ length: 10 }, (_, i) => {
      const randomDate = new Date(now.getTime() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      const status = statusOptions[Math.floor(Math.random() * statusOptions.length)] as 'active' | 'resolved' | 'pending' | 'escalated';
      const userName = userNames[Math.floor(Math.random() * userNames.length)];
      const lastMessageText = randomTexts[Math.floor(Math.random() * randomTexts.length)];
      
      // Generate 3-8 messages for this conversation
      const numMessages = Math.floor(Math.random() * 6) + 3;
      const messages: Message[] = [];
      
      for (let j = 0; j < numMessages; j++) {
        const isUser = j % 2 === 0;
        const messageDate = new Date(randomDate.getTime() - (numMessages - j) * 3 * 60 * 1000);
        
        messages.push({
          id: `msg-${i}-${j}`,
          sender: isUser ? 'user' : 'bot',
          text: isUser 
            ? randomTexts[Math.floor(Math.random() * randomTexts.length)]
            : "Thanks for reaching out! I'm here to help. Can you please provide more details about your issue?",
          timestamp: messageDate,
          status: isUser ? 'read' : undefined
        });
      }
      
      return {
        id: `conv-${i}`,
        user: {
          name: userName,
          id: `user-${i}`,
          avatar: undefined // We could add mock avatars here
        },
        lastMessage: {
          text: lastMessageText,
          timestamp: randomDate
        },
        status,
        unread: Math.random() > 0.7,
        messages
      };
    });
  };

  const handleSendMessage = () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    const newMessage: Message = {
      id: `msg-new-${Date.now()}`,
      sender: 'bot',
      text: replyText,
      timestamp: new Date(),
    };
    
    // Add new message to the selected conversation
    const updatedConversation = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: {
        text: replyText,
        timestamp: new Date()
      }
    };
    
    // Update the conversations list
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation.id ? updatedConversation : conv
    ));
    
    // Update the selected conversation
    setSelectedConversation(updatedConversation);
    
    // Clear the reply text
    setReplyText('');
  };

  // Filter conversations based on search query and active filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery === '' || 
      conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = activeFilter === 'all' || conv.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

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
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  
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
                    <button
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-1 rounded-full"
                    >
                      <Filter className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <MessageSquare className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-gray-500">No conversations found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                          selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedConversation(conv)}
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
                {selectedConversation ? (
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
                        <button className="p-2 rounded-full hover:bg-gray-100">
                          <Download className="w-5 h-5 text-gray-500" />
                        </button>
                        <div className="relative">
                          <button className="p-2 rounded-full hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                          {/* Dropdown would go here */}
                        </div>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedConversation.messages.map((message) => (
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
                      ))}
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
                          ></textarea>
                        </div>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg h-10 flex items-center justify-center disabled:opacity-50"
                          onClick={handleSendMessage}
                          disabled={!replyText.trim()}
                        >
                          Send
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