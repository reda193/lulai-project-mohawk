// components/Navigation/AgentNavigation.tsx
'use client';

import { BarChart2, MessageSquare, Link as LinkIcon, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
      "flex flex-col items-center gap-1 px-4 py-3 text-sm font-medium transition-colors",
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
  
  const navItems = [
    { 
      href: `/agents/${agentId}/overview`, 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: 'Overview' 
    },
    { 
      href: `/agents/${agentId}/analytics`, 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: 'Analytics' 
    },
    { 
      href: `/agents/${agentId}/conversations`, 
      icon: <MessageSquare className="w-5 h-5" />, 
      label: 'Conversations' 
    },
    { 
      href: `/agents/${agentId}/integrations`, 
      icon: <LinkIcon className="w-5 h-5" />, 
      label: 'Integrations' 
    },
    { 
      href: `/agents/${agentId}/settings`, 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings' 
    },
  ];

  return (
    <div className={cn("w-full bg-white border-b border-gray-200", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <h1 className="text-xl font-semibold">Agent Details</h1>
      </div>
      <nav className="flex">
        {navItems.map((item) => (
          <AgentNavItem 
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href || (pathname.includes(agentId) && pathname.endsWith(item.label.toLowerCase()))}
          />
        ))}
      </nav>
    </div>
  );
};

export default AgentNavigation;