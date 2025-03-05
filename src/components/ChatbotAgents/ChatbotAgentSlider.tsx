'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Updated interface to include avatar information
interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface ChatbotAgent {
  id: string;
  name: string;
  status: string;
  appearance?: BotAppearance | null;
}

interface ChatbotAgentSliderProps {
  agents: ChatbotAgent[];
  className?: string;
}

const ChatbotAgentSlider = ({ agents, className = '' }: ChatbotAgentSliderProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle slider navigation
  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const container = sliderRef.current;
    const scrollAmount = 300; // Adjust scroll amount as needed
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setScrollPosition(Math.max(0, scrollPosition - scrollAmount));
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setScrollPosition(scrollPosition + scrollAmount);
    }
  };

  // Check if scroll buttons should be visible
  const showLeftButton = scrollPosition > 0;
  const showRightButton = sliderRef.current 
    ? scrollPosition < sliderRef.current.scrollWidth - sliderRef.current.clientWidth
    : false;

  // Update scroll position on container scroll
  const handleScroll = () => {
    if (sliderRef.current) {
      setScrollPosition(sliderRef.current.scrollLeft);
    }
  };

  // Effect to handle scrolling - using a ref callback to avoid the useEffect
  const setSliderRef = (element: HTMLDivElement | null) => {
    sliderRef.current = element;
    if (element) {
      element.addEventListener('scroll', handleScroll);
    }
  };

  if (agents.length === 0) {
    return (
      <div className="w-full p-8 bg-gray-50 border border-dashed border-gray-300 rounded-md text-center">
        <p className="text-gray-500 mb-4">You don't have any chatbot agents yet</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Chatbot Agents Deployed
      </h2>
      
      <div className="relative">
        {/* Left scroll button */}
        {showLeftButton && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {/* Right scroll button */}
        {showRightButton && (
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        
        {/* Slider container */}
        <div 
          ref={setSliderRef}
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {agents.map((agent) => (
            <div 
              key={agent.id || agent.name}
              className="min-w-[220px] bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
              onClick={() => window.location.href = `/agents/${agent.id}`}
            >
              <div className="flex flex-col items-center">
                {/* Avatar display logic */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  {agent.appearance?.bot_avatar ? (
                    <Image 
                      src={agent.appearance.bot_avatar}
                      alt={`${agent.name} avatar`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to MessageSquare icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.classList.add('bg-gray-100');
                        // Add icon - needs to be done in a more React-friendly way in production
                        const icon = document.createElement('div');
                        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-gray-700"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;
                        target.parentElement?.appendChild(icon);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-gray-700" />
                    </div>
                  )}
                </div>
                <h3 className="text-md font-medium text-center">{agent.name}</h3>
                <span className={`text-xs mt-1 ${agent.status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {agent.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatbotAgentSlider;