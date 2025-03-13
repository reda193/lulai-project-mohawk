'use client';

import { BarChart2, MessageSquare, Link as LinkIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface AgentNavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const AgentNavItem = ({ href, icon, label, active }: AgentNavItemProps) => (
  <Link
    href={href}
    className={cn(
      "flex flex-col items-center gap-1 px-4 py-3 text-sm font-medium transition-colors relative",
      active
        ? "text-black border-b-2 border-black"
        : "text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-300"
    )}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

interface AgentNavigationProps {
  agentId: string;
  className?: string;
}

const AgentNavigation = ({ agentId, className }: AgentNavigationProps) => {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);
  
  // State for showing sub-navs
  const [forceShowSettings, setForceShowSettings] = useState(false);
  const [forceShowAnalytics, setForceShowAnalytics] = useState(false);
  
  useEffect(() => {
    // Check if we're on any settings-related page
    const isSettingsPage = 
      pathname.includes('/settings') || 
      pathname.includes('/appearance') || 
      pathname.includes('/starter-questions') || 
      pathname.includes('/qa');
    
    // Check if we're on any analytics-related page
    const isAnalyticsPage =
      pathname.includes('/analytics') ||
      pathname.includes('/resolution-rate') ||
      pathname.includes('/csat') ||
      pathname.includes('/session-volume') ||
      pathname.includes('/escalation-rate') ||
      pathname.includes('/knowledge-base-utilization') ||
      pathname.includes('/average-response-time') ||
      pathname.includes('/unrecognized-queries') ||
      pathname.includes('/lead-generation') ||
      pathname.includes('/training-coverage') ||
      pathname.includes('/sentiment-trends');
    
    console.log("Is settings page:", isSettingsPage);
    console.log("Is analytics page:", isAnalyticsPage);
    
    setForceShowSettings(isSettingsPage);
    setForceShowAnalytics(isAnalyticsPage);
    
    // If we're on a settings page, manually force the sub-navigation to show
    if (isSettingsPage) {
      const subNavElement = document.querySelector('.settings-subnav');
      if (subNavElement) {
        subNavElement.classList.remove('hidden');
        subNavElement.classList.add('flex');
      }
    }
    
    // If we're on an analytics page, manually force the sub-navigation to show
    if (isAnalyticsPage) {
      const subNavElement = document.querySelector('.analytics-subnav');
      if (subNavElement) {
        subNavElement.classList.remove('hidden');
        subNavElement.classList.add('flex');
      }
    }
  }, [pathname]);
  
  // Safety check
  const safeAgentId = agentId || '';
  
  const navItems = [
    {
      href: `/agents/${safeAgentId}/overview`,
      icon: <BarChart2 className="w-5 h-5" />,
      label: 'Overview'
    },
    {
      href: `/agents/${safeAgentId}/analytics`,
      icon: <BarChart2 className="w-5 h-5" />,
      label: 'Analytics'
    },
    {
      href: `/agents/${safeAgentId}/conversations`,
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'Conversations'
    },
    {
      href: `/agents/${safeAgentId}/integrations`,
      icon: <LinkIcon className="w-5 h-5" />,
      label: 'Integrations'
    },
    {
      href: `/agents/${safeAgentId}/settings`,
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings'
    },
  ];
  
  // Define settings subnav items
  const settingsSubNavItems = [
    {
      href: `/agents/${safeAgentId}/settings`,
      label: 'General'
    },
    {
      href: `/agents/${safeAgentId}/settings/appearance`,
      label: 'Appearance'
    },
    {
      href: `/agents/${safeAgentId}/settings/training-settings`,
      label: 'Training Data'
    },
  ];

  // Define analytics subnav items
  const analyticsSubNavItems = [
    {
      href: `/agents/${safeAgentId}/analytics`,
      label: 'Overview'
    },
    {
      href: `/agents/${safeAgentId}/analytics/resolution-rate`,
      label: 'Resolution Rate'
    },
    {
      href: `/agents/${safeAgentId}/analytics/csat`,
      label: 'CSAT'
    },
    {
      href: `/agents/${safeAgentId}/analytics/session-volume`,
      label: 'Session Volume'
    },
    {
      href: `/agents/${safeAgentId}/analytics/escalation-rate`,
      label: 'Escalation Rate'
    },
    {
      href: `/agents/${safeAgentId}/analytics/knowledge-base-utilization`,
      label: 'Knowledge Base Utilization'
    },
    {
      href: `/agents/${safeAgentId}/analytics/average-response-time`,
      label: 'Average Response Time'
    },
    {
      href: `/agents/${safeAgentId}/analytics/unrecognized-queries`,
      label: 'Unrecognized Queries'
    },
    {
      href: `/agents/${safeAgentId}/analytics/lead-generation`,
      label: 'Lead Generation'
    },
    {
      href: `/agents/${safeAgentId}/analytics/training-coverage`,
      label: 'Training Coverage'
    },
    {
      href: `/agents/${safeAgentId}/analytics/sentiment-trends`,
      label: 'Sentiment Trends'
    },
  ];

  // Check if the current page matches a specific section
  const isActiveSection = (label: string) => {
    if (label === 'Settings') {
      return forceShowSettings || pathname.includes('/settings');
    }
    if (label === 'Analytics') {
      return forceShowAnalytics || pathname.includes('/analytics');
    }
    return pathname.includes(label.toLowerCase());
  };

  return (
    <div className={cn("w-full bg-white", className)}>
      <div className="w-full flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Agent Details</h1>
      </div>
      
      {/* Main Navigation */}
      <nav className="w-full flex border-b border-gray-200">
        {navItems.map((item) => (
          <AgentNavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActiveSection(item.label)}
          />
        ))}
      </nav>
      
      {/* Settings Subnav */}
      <div className={`w-full settings-subnav border-b border-gray-200 bg-white ${forceShowSettings ? 'flex' : 'hidden'} overflow-x-auto`}>
        {settingsSubNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              pathname === item.href || pathname.endsWith(item.label.toLowerCase())
                ? "text-black border-b-2 border-black" 
                : "text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      
      {/* Analytics Subnav */}
      <div className={`w-full analytics-subnav border-b border-gray-200 bg-white ${forceShowAnalytics ? 'flex' : 'hidden'} overflow-x-auto`}>
        {analyticsSubNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              pathname === item.href || pathname.endsWith(item.label.toLowerCase().replace(' ', '-'))
                ? "text-black border-b-2 border-black" 
                : "text-gray-600 hover:text-black hover:border-b-2 hover:border-gray-300"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AgentNavigation;