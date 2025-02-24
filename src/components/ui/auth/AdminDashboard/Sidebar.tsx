'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  BarChart2, 
  MessageSquare, 
  Layout,
  Settings,
  Bell,
  Mail,
  UserCircle2 
} from 'lucide-react';

interface SidebarProps {
  mainItems: Array<{
    icon: React.ComponentType<{className?: string}>;
    label: string;
    active: boolean;
  }>;
  personalItems: Array<{
    icon: React.ComponentType<{className?: string}>;
    label: string;
    active?: boolean;
    notification?: boolean;
  }>;
  onItemSelect: (label: string) => void;
}

export default function Sidebar({ mainItems, personalItems, onItemSelect }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 py-6 px-4 flex flex-col">
      {/* Logo */}
      <div className="flex items-center mb-8 px-4">
        <span className="text-2xl font-bold text-black">LulAI</span>
      </div>

      {/* Working Space */}
      <div className="mb-6">
        <p className="px-4 text-xs text-gray-500 mb-2">Working Space</p>
        <div className="space-y-2">
          {mainItems.map((item, index) => (
            <div 
              key={index} 
              className={`
                flex items-center px-4 py-2 rounded-lg cursor-pointer
                ${item.active ? 'bg-black text-white' : 'hover:bg-gray-100'}
              `}
              onClick={() => onItemSelect(item.label)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal */}
      <div className="mb-6">
        <p className="px-4 text-xs text-gray-500 mb-2">Personal</p>
        <div className="space-y-2">
          {personalItems.map((item, index) => (
            <div 
              key={index} 
              className={`
                flex items-center px-4 py-2 rounded-lg cursor-pointer relative
                ${item.active ? 'bg-black text-white' : 'hover:bg-gray-100'}
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.notification && (
                <div className="absolute right-4 w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 overflow-hidden">
            <Image 
              src="/placeholder-avatar.jpg" 
              alt="Profile" 
              width={40} 
              height={40} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Amanda Goldberg</p>
            <p className="text-xs text-gray-500">View Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}