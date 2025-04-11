'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, Save, Bell, Key, Globe, Palette, CreditCard, Shield, FileText, Users, ChevronRight, Info, Moon, Sun, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import { useSession } from 'next-auth/react';

// Settings tabs
const TABS = [
  { id: 'account', name: 'Account', icon: <Users className="w-5 h-5" /> },
  { id: 'security', name: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'notifications', name: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'appearance', name: 'Appearance', icon: <Palette className="w-5 h-5" /> },
  { id: 'billing', name: 'Billing', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'api', name: 'API Keys', icon: <Key className="w-5 h-5" /> },
  { id: 'localization', name: 'Localization', icon: <Globe className="w-5 h-5" /> },
  { id: 'privacy', name: 'Privacy', icon: <FileText className="w-5 h-5" /> },
];

const SettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('account');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [pushNotifications, setPushNotifications] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('en');
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

  // Handle settings changes
  const handleSaveSettings = () => {
    // This would normally save to an API
    alert('Settings saved!');
  };

  // Helper to render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="TechCorp Solutions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Retail</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>501-1000 employees</option>
                    <option>1000+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="h-px bg-gray-200 my-4"></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Info className="text-yellow-600 w-5 h-5 mt-0.5 mr-3" />
                  <p className="text-sm text-yellow-800">
                    Two-factor authentication adds an extra layer of security to your account. 
                    In addition to your password, you'll need to enter a code sent to your phone.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Session Management</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium">Active Sessions</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Chrome on Windows</p>
                      <p className="text-sm text-gray-600">
                        <span className="text-green-600">●</span> Active now · Your current session
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      More info
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Safari on MacOS</p>
                      <p className="text-sm text-gray-600">Last active: 2 days ago</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Revoke
                    </button>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mobile App on iPhone</p>
                      <p className="text-sm text-gray-600">Last active: 5 days ago</p>
                    </div>
                    <button className="text-sm text-red-600 hover:text-red-800">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Bot Activity</p>
                    <p className="text-sm text-gray-600">Receive emails about conversations and activity from your bots</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="bot-activity"
                      className="opacity-0 w-0 h-0"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                    />
                    <label
                      htmlFor="bot-activity"
                      className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                        emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                          emailNotifications ? 'transform translate-x-6' : ''
                        }`} 
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Marketing Updates</p>
                    <p className="text-sm text-gray-600">Receive emails about new features, products, and offers</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="marketing-updates"
                      className="opacity-0 w-0 h-0"
                      checked={false}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor="marketing-updates"
                      className="absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer bg-gray-300"
                    >
                      <span className="absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Security Alerts</p>
                    <p className="text-sm text-gray-600">Receive emails about security updates and account activity</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="security-alerts"
                      className="opacity-0 w-0 h-0"
                      checked={true}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor="security-alerts"
                      className="absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span className="absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transform translate-x-6" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Info className="text-blue-600 w-5 h-5 mt-0.5 mr-3" />
                  <p className="text-sm text-blue-800">
                    Push notifications are only available on the mobile app or through browsers that support them.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Enable Push Notifications</p>
                    <p className="text-sm text-gray-600">Allow notifications to appear on your device</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="push-notifications"
                      className="opacity-0 w-0 h-0"
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                    />
                    <label
                      htmlFor="push-notifications"
                      className={`absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer transition-colors duration-200 ${
                        pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span 
                        className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                          pushNotifications ? 'transform translate-x-6' : ''
                        }`} 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${!isDarkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setIsDarkMode(false)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Light Mode</span>
                    <Sun className={`w-5 h-5 ${!isDarkMode ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="h-24 bg-white border border-gray-200 rounded-md"></div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${isDarkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setIsDarkMode(true)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Dark Mode</span>
                    <Moon className={`w-5 h-5 ${isDarkMode ? 'text-blue-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="h-24 bg-gray-800 border border-gray-700 rounded-md"></div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">System Default</span>
                    <RefreshCw className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="h-24 bg-gradient-to-r from-white to-gray-800 border border-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                <div className="w-full">
                  <div className="h-12 rounded-md bg-blue-600 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Blue (Default)</span>
                </div>
                <div className="w-full">
                  <div className="h-12 rounded-md bg-purple-600 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Purple</span>
                </div>
                <div className="w-full">
                  <div className="h-12 rounded-md bg-green-600 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Green</span>
                </div>
                <div className="w-full">
                  <div className="h-12 rounded-md bg-red-600 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Red</span>
                </div>
                <div className="w-full">
                  <div className="h-12 rounded-md bg-amber-600 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Amber</span>
                </div>
                <div className="w-full">
                  <div className="h-12 rounded-md bg-gray-800 mb-2 cursor-pointer"></div>
                  <span className="text-sm text-gray-700">Dark</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'localization':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Language</h3>
              <div className="max-w-md">
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="en">English (US)</option>
                  <option value="en-gb">English (UK)</option>
                  <option value="fr">Français (French)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="it">Italiano (Italian)</option>
                  <option value="pt">Português (Portuguese)</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="zh">中文 (Chinese)</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Date & Time Format</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>MM/DD/YYYY (05/15/2023)</option>
                    <option>DD/MM/YYYY (15/05/2023)</option>
                    <option>YYYY-MM-DD (2023-05-15)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>12-hour (2:30 PM)</option>
                    <option>24-hour (14:30)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Pacific Time (UTC-08:00)</option>
                    <option>Mountain Time (UTC-07:00)</option>
                    <option>Central Time (UTC-06:00)</option>
                    <option>Eastern Time (UTC-05:00)</option>
                    <option>UTC</option>
                    <option>Central European Time (UTC+01:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">API Keys</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Generate New Key
                </button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="text-yellow-600 w-5 h-5 mt-0.5 mr-3" />
                  <p className="text-sm text-yellow-800">
                    Your API keys carry many privileges, so be sure to keep them secure. 
                    Do not share your API keys in publicly accessible areas such as GitHub, client-side code, etc.
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium">Active API Keys</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">●</span>
                        <span className="font-medium">Production Key</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-gray-600 hover:text-gray-900">Copy</button>
                        <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                      </div>
                    </div>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">••••••••••••••••XYZ123</p>
                    <p className="text-xs text-gray-600 mt-1">Created on May 10, 2023 · Last used 2 hours ago</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">●</span>
                        <span className="font-medium">Development Key</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-gray-600 hover:text-gray-900">Copy</button>
                        <button className="text-sm text-red-600 hover:text-red-800">Revoke</button>
                      </div>
                    </div>
                    <p className="text-sm font-mono bg-gray-100 p-2 rounded">••••••••••••••••ABC456</p>
                    <p className="text-xs text-gray-600 mt-1">Created on April 15, 2023 · Last used 3 days ago</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">API Usage</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Current Billing Period</p>
                    <p className="font-medium">May 1, 2023 - May 31, 2023</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rate Limit</p>
                    <p className="font-medium">10,000 requests / minute</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">API Calls</p>
                      <p className="text-sm text-gray-600">130,500 / 500,000</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full w-[26%]"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-medium">Storage</p>
                      <p className="text-sm text-gray-600">2.3 GB / 10 GB</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full w-[23%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

        case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Current Plan</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-blue-800">Pro Plan - $49/month</h4>
                    <p className="text-blue-700">Your subscription renews on June 1, 2023</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                      Cancel Plan
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Upgrade Plan
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-4">
                  <div>
                    <p className="font-medium">Bots</p>
                    <p className="text-gray-600 text-sm">Number of bots you can create</p>
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
                    <p className="font-bold">130,500 / 500,000</p>
                    <p className="text-gray-600 text-sm">26% used</p>
                  </div>
                </div>
                
                <div className="flex justify-between pb-4">
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
            
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Method</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <h4 className="font-medium">Credit Card</h4>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-blue-600 rounded"></div>
                      <span className="font-medium">•••• •••• •••• 4242</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-sm text-red-600 hover:text-red-800">Remove</button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Expires 12/2025</p>
                  </div>
                </div>
              </div>
              
              <button className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800">
                <CreditCard className="w-4 h-4" />
                <span>Add new payment method</span>
              </button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Billing History</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Description</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-right font-medium text-gray-700">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-4 text-gray-700">May 1, 2023</td>
                      <td className="px-4 py-4 text-gray-700">Pro Plan - Monthly</td>
                      <td className="px-4 py-4 text-gray-700">$49.00</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800">Download</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-700">Apr 1, 2023</td>
                      <td className="px-4 py-4 text-gray-700">Pro Plan - Monthly</td>
                      <td className="px-4 py-4 text-gray-700">$49.00</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800">Download</button>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 text-gray-700">Mar 1, 2023</td>
                      <td className="px-4 py-4 text-gray-700">Pro Plan - Monthly</td>
                      <td className="px-4 py-4 text-gray-700">$49.00</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-800">Download</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Data Collection</p>
                    <p className="text-sm text-gray-600">Allow us to collect usage data to improve our services</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="data-collection"
                      className="opacity-0 w-0 h-0"
                      checked={true}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor="data-collection"
                      className="absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer bg-blue-600"
                    >
                      <span className="absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transform translate-x-6" />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Cookie Preferences</p>
                    <p className="text-sm text-gray-600">Manage cookie settings for this website</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    Manage Cookies
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Marketing Preferences</p>
                    <p className="text-sm text-gray-600">Allow us to use your data for personalized marketing</p>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                    <input
                      type="checkbox"
                      id="marketing-pref"
                      className="opacity-0 w-0 h-0"
                      checked={false}
                      onChange={() => {}}
                    />
                    <label
                      htmlFor="marketing-pref"
                      className="absolute top-0 left-0 right-0 bottom-0 rounded-full cursor-pointer bg-gray-300"
                    >
                      <span className="absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Data Management</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Info className="text-yellow-600 w-5 h-5 mt-0.5 mr-3" />
                  <p className="text-sm text-yellow-800">
                    Requesting data deletion or export will affect all data associated with your account.
                    This process cannot be undone once initiated.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Export All Data</span>
                </button>
                <button className="px-4 py-2 bg-red-50 border border-red-300 text-red-600 rounded-md hover:bg-red-100 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Request Data Deletion</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Legal Documents</h3>
              <div className="space-y-2">
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  <span>Privacy Policy</span>
                </a>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  <span>Terms of Service</span>
                </a>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  <span>Data Processing Agreement</span>
                </a>
                <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                  <ChevronRight className="w-4 h-4 mr-1" />
                  <span>Cookie Policy</span>
                </a>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Select a tab to view settings</p>
          </div>
        );
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            
            <button
              onClick={handleSaveSettings}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-medium">Settings</h2>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    {TABS.map((tab) => (
                      <li key={tab.id}>
                        <button
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-3">{tab.icon}</span>
                          <span>{tab.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
            
            {/* Settings Content */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-lg shadow p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;