// components/ChatbotPreview/ChatbotPreview.tsx
import { FC, useState, useEffect } from 'react';
import { MessageSquare, HelpCircle, HeadphonesIcon, Settings, X, Send, Plus } from 'lucide-react';
import Image from 'next/image';

interface ChatbotPreviewProps {
  formData: {
    company_logo?: string;
    bot_avatar?: string;
    accent_color: string;
    widget_icon: string;
    widget_position: string;
    input_placeholder: string;
    branding_enabled: boolean;
    widget_open_by_default: boolean;
    starter_questions: boolean;
  };
}

const ChatbotPreview: FC<ChatbotPreviewProps> = ({ formData }) => {
  // State to control whether the chatbot widget is open or closed in the preview
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{id: number, sender: string, text: string}>>([]);
  
  // Update isOpen when widget_open_by_default changes
  useEffect(() => {
    setIsOpen(formData.widget_open_by_default);
  }, [formData.widget_open_by_default]);
  
  // Initialize with a welcome message when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 1, sender: 'bot', text: 'Hello! How can I help you today?' }]);
    }
  }, [isOpen, messages.length]);

  // Sample starter questions
  const starterQuestions = [
    'What services do you offer?',
    'How do I create an account?',
    'What are your business hours?'
  ];

  // Handle sending a message
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const newUserMessage = { id: messages.length + 1, sender: 'user', text: inputValue };
    setMessages([...messages, newUserMessage]);
    setInputValue('');
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses = [
        "I'm happy to help with that!",
        "Thanks for your question. Let me find that information for you.",
        "Great question! Here's what you need to know...",
        "I understand what you're asking. Let me assist you with that."
      ];
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const newBotMessage = { id: messages.length + 2, sender: 'bot', text: randomResponse };
      setMessages(prev => [...prev, newBotMessage]);
    }, 800);
  };

  // Handle clicking a starter question
  const handleStarterQuestionClick = (question: string) => {
    // Add the question as a user message
    const newUserMessage = { id: messages.length + 1, sender: 'user', text: question };
    setMessages([...messages, newUserMessage]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      const newBotMessage = { 
        id: messages.length + 2, 
        sender: 'bot', 
        text: `Thanks for asking about "${question.substring(0, 15)}...". Here's what you should know...` 
      };
      setMessages(prev => [...prev, newBotMessage]);
    }, 800);
  };

  // Get the icon component based on widget_icon setting
  const getWidgetIcon = () => {
    switch (formData.widget_icon) {
      case 'message':
        return <MessageSquare size={22} />;
      case 'help':
        return <HelpCircle size={22} />;
      case 'support':
        return <HeadphonesIcon size={22} />;
      case 'chat':
        return <MessageSquare size={22} />;
      case 'custom':
        return <Settings size={22} />;
      default:
        return <MessageSquare size={22} />;
    }
  };

  // Get positioning classes based on widget_position setting
  const getPositionClasses = () => {
    switch (formData.widget_position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Render bot avatar (in conversations or header)
  const renderBotAvatar = (size: 'sm' | 'md' = 'md') => {
    const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
    const iconSize = size === 'sm' ? 12 : 16;
    
    if (formData.bot_avatar) {
      return (
        <div className={`${sizeClasses} rounded-full overflow-hidden flex-shrink-0`}>
          <img src={formData.bot_avatar} alt="Bot" className="w-full h-full object-cover" />
        </div>
      );
    } else {
      return (
        <div className={`${sizeClasses} rounded-full bg-white/20 flex items-center justify-center flex-shrink-0`}>
          <MessageSquare size={iconSize} />
        </div>
      );
    }
  };

  return (
    <div className="relative w-64 h-[420px] bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-md">
      {!isOpen && !messages.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-400 text-xs">Chatbot Preview</span>
        </div>
      )}

      {/* Widget Button (Closed State) */}
      {!isOpen && (
        <div 
          className={`absolute ${getPositionClasses()} p-3 rounded-full cursor-pointer shadow-lg z-10 text-white`}
          style={{ backgroundColor: formData.accent_color }}
          onClick={() => setIsOpen(true)}
        >
          {getWidgetIcon()}
        </div>
      )}

      {/* Chat Interface (Open State) */}
      {isOpen && (
        <div className="absolute inset-0 flex flex-col bg-white shadow-lg">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-3 py-2"
            style={{ backgroundColor: formData.accent_color }}
          >
            <div className="flex items-center">
              {renderBotAvatar()}
              <div className="text-white text-sm font-medium ml-2">Chat Assistant</div>
            </div>
            <button 
              className="text-white/80 hover:text-white" 
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {/* Company Logo (if branding is enabled) */}
          {formData.branding_enabled && (
            <div className="flex justify-center py-2 bg-gray-50 border-b border-gray-200">
              {formData.company_logo ? (
                <div className="h-5">
                  <img src={formData.company_logo} alt="Company" className="h-full" />
                </div>
              ) : (
                <div className="text-xs text-gray-400">Company Logo</div>
              )}
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'bot' && (
                  <div className="mr-1.5 mt-1">
                    {renderBotAvatar('sm')}
                  </div>
                )}
                <div 
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-xs ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  style={message.sender === 'user' ? { backgroundColor: formData.accent_color } : {}}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          {/* Starter Questions (if enabled) */}
          {formData.starter_questions && messages.length < 3 && (
            <div className="px-3 py-2 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Suggested questions:</div>
              <div className="flex flex-wrap gap-1">
                {starterQuestions.map((question, index) => (
                  <div 
                    key={index}
                    className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full cursor-pointer transition-colors"
                    onClick={() => handleStarterQuestionClick(question)}
                  >
                    {question.length > 15 ? `${question.substring(0, 15)}...` : question}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-3 py-2 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded-l-md focus:outline-none"
                placeholder={formData.input_placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                className="px-2 py-1.5 rounded-r-md text-white"
                style={{ backgroundColor: formData.accent_color }}
                onClick={handleSendMessage}
              >
                <Send size={14} />
              </button>
            </div>
          </div>

          {/* LulAI Branding Footer */}
          {formData.branding_enabled && (
            <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 flex items-center justify-center">
              <div className="text-[10px] text-gray-400">
                Powered by LulAI
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotPreview;