'use client';

import { useState, useEffect } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams } from 'next/navigation';

const AppearancePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const [agentId, setAgentId] = useState<string>('');
  const [formData, setFormData] = useState({
    company_logo: null,
    bot_avatar: null,
    accent_color: '',
    widget_icon: 'message',
    widget_position: 'bottom-right',
    input_placeholder: 'Type a message...',
    branding_enabled: false,
    widget_open_by_default: false,
    starter_questions: false
  });

  // Colors for accent color selection
  const colors = [
    '#DC2626', '#EA580C', '#EAB308', '#84CC16', '#10B981', 
    '#00A3FF', '#2563EB', '#7C3AED', '#EC4899'
  ];

  const widgetPositions = [
    'bottom-right',
    'bottom-left',
    'top-right',
    'top-left'
  ];

  const widgetIcons = [
    'message',
    'chat',
    'help',
    'support',
    'custom'
  ];

  // Extract and validate the agent ID
  useEffect(() => {
    if (params?.id) {
      const id = params.id as string;
      setAgentId(id);
    } else {
      const path = window.location.pathname;
      const matches = path.match(/\/agents\/([^\/]+)/);
      if (matches && matches[1]) {
        setAgentId(matches[1]);
      }
    }
  }, [params]);

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file uploads
  const handleLogoUpload = () => {
    // TODO: Implement file upload logic
    console.log('Logo upload triggered');
  };

  const handleAvatarUpload = () => {
    // TODO: Implement file upload logic
    console.log('Avatar upload triggered');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual form submission logic
    console.log('Form submitted:', formData);
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
        {/* Always render AgentNavigation with fallback */}
        <AgentNavigation agentId={agentId || 'unknown'} />

        {/* Page Content */}
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 m-8 space-y-6">
            <h2 className="text-lg font-medium">Appearance Settings</h2>
            
            <div className="space-y-4">
              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.company_logo && (
                    <img
                      src={formData.company_logo as string}
                      alt="Company Logo"
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={handleLogoUpload}
                  >
                    Upload Logo
                  </button>
                </div>
              </div>

              {/* Bot Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bot Avatar
                </label>
                <div className="flex items-center space-x-4">
                  {formData.bot_avatar && (
                    <img
                      src={formData.bot_avatar as string}
                      alt="Bot Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={handleAvatarUpload}
                  >
                    Upload Avatar
                  </button>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.accent_color === color ? 'border-black' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleChange('accent_color', color)}
                    />
                  ))}
                </div>
              </div>

              {/* Widget Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Icon
                </label>
                <select
                  value={formData.widget_icon}
                  onChange={(e) => handleChange('widget_icon', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {widgetIcons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Widget Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Widget Position
                </label>
                <select
                  value={formData.widget_position}
                  onChange={(e) => handleChange('widget_position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {widgetPositions.map((position) => (
                    <option key={position} value={position}>
                      {position.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={formData.input_placeholder}
                  onChange={(e) => handleChange('input_placeholder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Type a message..."
                />
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                {/* Branding */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Enable LulAI Branding
                  </label>
                  <div 
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.branding_enabled ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    onClick={() => handleChange('branding_enabled', !formData.branding_enabled)}
                  >
                    <div 
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform ${
                        formData.branding_enabled ? 'translate-x-5' : ''
                      }`} 
                    />
                  </div>
                </div>

                {/* Widget Open by Default */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Open Widget by Default
                  </label>
                  <div 
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.widget_open_by_default ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    onClick={() => handleChange('widget_open_by_default', !formData.widget_open_by_default)}
                  >
                    <div 
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform ${
                        formData.widget_open_by_default ? 'translate-x-5' : ''
                      }`} 
                    />
                  </div>
                </div>

                {/* Starter Questions */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Show Starter Questions
                  </label>
                  <div 
                    className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.starter_questions ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    onClick={() => handleChange('starter_questions', !formData.starter_questions)}
                  >
                    <div 
                      className={`absolute w-5 h-5 bg-white rounded-full top-0.5 left-0.5 transition-transform ${
                        formData.starter_questions ? 'translate-x-5' : ''
                      }`} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;