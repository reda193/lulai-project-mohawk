'use client';

import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from './Sidebar';

// This is a client component wrapper
interface SidebarWrapperProps {
  userData: {
    firstName: string;
    lastName: string;
  };
  children?: React.ReactNode; // Add children prop to wrap main content
}

export default function SidebarWrapper({ userData, children }: SidebarWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  return (
    <>
      {/* Menu Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
      >
        <MenuIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar Component */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        userName={userData}
      />
      
      {/* Main Content - Will adjust based on sidebar state */}
      <div className={`
        flex-1 transition-all duration-300
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        {children}
      </div>
    </>
  );
}