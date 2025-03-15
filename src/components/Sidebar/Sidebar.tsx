'use client';

import { FC, useState, useEffect } from 'react';
import {
  HomeIcon,
  UsersIcon,
  UserIcon,
  MessageCircleIcon,
  SettingsIcon,
  MoreVerticalIcon,
  ShieldIcon,
  LayoutDashboardIcon,
  CreditCardIcon,
  HeadphonesIcon,
  ShieldAlertIcon,
  StarIcon,
  ServerIcon,
  BriefcaseIcon,
  MessagesSquareIcon
} from 'lucide-react';
import SidebarItem from './SidebarItem';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userName?: {
    firstName?: string | null;
    lastName?: string | null;
    role?: string;
  } | null;
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onToggle, userName }) => {
  // Use a safe default path for initial render
  const [currentPath, setCurrentPath] = useState('/');
  const [isMounted, setIsMounted] = useState(false);
  
  // Only use router after component has mounted
  useEffect(() => {
    setIsMounted(true);
    const path = window.location.pathname;
    setCurrentPath(path);
  }, []);
  
  // Get user role (default to 'MEMBER' if not provided)
  const userRole = userName?.role || 'MEMBER';
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';
  
  // Define navigation items for all users
  const navigationItems = [
    { icon: HomeIcon, label: 'Home', href: '/dashboard' },
    { icon: UsersIcon, label: 'Agents', href: '/agents' },
  ];
  
  // Personal items for user settings
  const personalItems = [
    { icon: UserIcon, label: 'Profile', href: '/profile' },
    { icon: MessageCircleIcon, label: 'Messages', href: '/messages' },
    { icon: SettingsIcon, label: 'Settings', href: '/settings' }
  ];
  
  // Admin-only items
  const adminItems = isAdmin ? [
    { icon: StarIcon, label: 'Features', href: '/feature' },
    { icon: CreditCardIcon, label: 'Subscription', href: '/subscription' },
    { icon: HeadphonesIcon, label: 'Support', href: '/support' },
    { icon: ShieldAlertIcon, label: 'Security', href: '/security' },
    { icon: ServerIcon, label: 'System', href: '/system' },
    { icon: BriefcaseIcon, label: 'Superadmin', href: '/superadmin' }
  ] : [];
  
  // Generate display name safely, with fallback to "User"
  const displayName = userName && (userName.firstName || userName.lastName)
    ? `${userName.firstName || ''} ${userName.lastName || ''}`.trim()
    : "User";
  
  return (
    <div className={`
      fixed top-0 left-0 h-full w-64 bg-white 
      transition-transform duration-300 z-40 flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-4 mb-10 border-b border-gray-100">
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-8">
          {/* Main Navigation */}
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-4">Main</div>
            <nav className="space-y-1">
              {navigationItems.map((item, index) => {
                const isActive = item.href === "/"
                  ? currentPath === "/"
                  : currentPath.startsWith(item.href);
                  
                return (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={isActive}
                  />
                );
              })}
            </nav>
          </div>
          
          {/* Admin Section (only shown to admins) */}
          {adminItems.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase mb-4">Administration</div>
              <nav className="space-y-1">
                {adminItems.map((item, index) => {
                  const isActive = currentPath.startsWith(item.href);
                  
                  return (
                    <SidebarItem
                      key={index}
                      icon={item.icon}
                      label={item.label}
                      href={item.href}
                      active={isActive}
                    />
                  );
                })}
              </nav>
            </div>
          )}
          
          {/* Personal Section */}
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-4">Personal</div>
            <nav className="space-y-1">
              {personalItems.map((item, index) => {
                const isActive = currentPath.startsWith(item.href);
                
                return (
                  <SidebarItem
                    key={index}
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    active={isActive}
                  />
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div>
            <div className="text-sm font-medium">{displayName}</div>
            <div className="text-xs text-gray-500">
              {userRole === 'SUPERADMIN' ? 'Super Admin' : 
               userRole === 'ADMIN' ? 'Administrator' : 'Member'}
            </div>
          </div>
          <button className="ml-auto">
            <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;