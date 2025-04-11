'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, User, Mail, Phone, Building, Calendar, Shield, Edit } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSession } from 'next-auth/react';

const ProfilePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Profile</h1>
          
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold">John Doe</h2>
                      <p className="text-gray-600">Company Administrator</p>
                    </div>
                    <button className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 sm:self-start">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-full">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">john.doe@example.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-full">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-full">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Company</p>
                        <p className="font-medium">TechCorp Solutions</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-full">
                        <Calendar className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Member Since</p>
                        <p className="font-medium">January 15, 2023</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Details Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Account Details</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value="John"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value="Doe"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value="john.doe@example.com"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value="+1 (555) 123-4567"
                      disabled
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value="TechCorp Solutions"
                    disabled
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Administrator</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Subscription Information */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Subscription Information</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-blue-800">Pro Plan</h3>
                    <p className="text-blue-700">Active until December 31, 2023</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Upgrade Plan
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="font-medium">Bots Created</p>
                    <p className="text-gray-600 text-sm">Total bots created under your account</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">5 / 10</p>
                    <p className="text-gray-600 text-sm">50% used</p>
                  </div>
                </div>
                
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="font-medium">API Requests</p>
                    <p className="text-gray-600 text-sm">Monthly API request limit</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">15,500 / 50,000</p>
                    <p className="text-gray-600 text-sm">31% used</p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Storage</p>
                    <p className="text-gray-600 text-sm">File storage for bot training</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">2.3 GB / 10 GB</p>
                    <p className="text-gray-600 text-sm">23% used</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;