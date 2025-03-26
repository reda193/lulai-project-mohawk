'use client';

import { useState, useEffect, useRef } from 'react';
import { MenuIcon, Upload } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams } from 'next/navigation';

const AppearancePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const [agentId, setAgentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Refs for file inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Form data with typed properties
  const [formData, setFormData] = useState({
    company_logo: null as string | null,
    bot_avatar: null as string | null,
    accent_color: '',
    widget_icon: 'message',
    widget_position: 'bottom-right',
    input_placeholder: 'Type a message...',
    branding_enabled: false,
    widget_open_by_default: false,
    starter_questions: false
  });

  // Files to upload
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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

  // Fetch appearance settings when agentId is available
  useEffect(() => {
    if (agentId && agentId !== 'unknown') {
      fetchAppearanceSettings();
    }
  }, [agentId]);

  // Fetch appearance settings from API
  const fetchAppearanceSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch(`/api/bot/${agentId}/appearance`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appearance settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update form data with retrieved settings
      setFormData({
        company_logo: data.company_logo || null,
        bot_avatar: data.bot_avatar || null,
        accent_color: data.accent_color || '',
        widget_icon: data.widget_icon || 'message',
        widget_position: data.widget_position || 'bottom-right',
        input_placeholder: data.input_placeholder || 'Type a message...',
        branding_enabled: data.branding_enabled === true,
        widget_open_by_default: data.widget_open_by_default === true,
        starter_questions: data.starter_questions === true
      });
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      setErrorMessage('Failed to load appearance settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Handle file uploads
  const handleLogoUpload = () => {
    logoInputRef.current?.click();
  };

  const handleAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      handleChange('company_logo', previewUrl);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a temporary URL for preview
      const previewUrl = URL.createObjectURL(file);
      handleChange('bot_avatar', previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentId || agentId === 'unknown') {
      setErrorMessage('Invalid bot ID. Please refresh the page and try again.');
      return;
    }
    
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Create FormData to handle file uploads
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('accent_color', formData.accent_color || '');
      formDataToSend.append('widget_icon', formData.widget_icon);
      formDataToSend.append('widget_position', formData.widget_position);
      formDataToSend.append('input_placeholder', formData.input_placeholder);
      formDataToSend.append('branding_enabled', String(formData.branding_enabled));
      formDataToSend.append('widget_open_by_default', String(formData.widget_open_by_default));
      formDataToSend.append('starter_questions', String(formData.starter_questions));
      
      // Add files if present
      if (logoFile) {
        formDataToSend.append('company_logo', logoFile);
      }
      
      if (avatarFile) {
        formDataToSend.append('bot_avatar', avatarFile);
      }
      
      // Send via POST for file uploads
      const response = await fetch(`/api/bot/${agentId}/appearance`, {
        method: 'POST',
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || `Failed to save appearance: ${response.status}`);
      }
      
      const updatedData = await response.json();
      
      // Reset file inputs
      setLogoFile(null);
      setAvatarFile(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      
      // Update form with the returned data if available
      if (updatedData.appearance) {
        setFormData({
          company_logo: updatedData.appearance.company_logo || null,
          bot_avatar: updatedData.appearance.bot_avatar || null,
          accent_color: updatedData.appearance.accent_color || '',
          widget_icon: updatedData.appearance.widget_icon || 'message',
          widget_position: updatedData.appearance.widget_position || 'bottom-right',
          input_placeholder: updatedData.appearance.input_placeholder || 'Type a message...',
          branding_enabled: updatedData.appearance.branding_enabled === true,
          widget_open_by_default: updatedData.appearance.widget_open_by_default === true,
          starter_questions: updatedData.appearance.starter_questions === true
        });
      }
      
      setSuccessMessage('Appearance settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving appearance settings:', error);
      setErrorMessage(error.message || 'Failed to save appearance settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-6 m-8 flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 m-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Appearance Settings</h2>
                
                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm">
                    {successMessage}
                  </div>
                )}
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                    {errorMessage}
                  </div>
                )}
              </div>
              
              <div className="space-y-5">
                {/* Company Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.company_logo ? (
                      <div className="relative w-16 h-16 border border-gray-200 rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                        <img
                          src={formData.company_logo}
                          alt="Company Logo"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                      onClick={handleLogoUpload}
                    >
                      {formData.company_logo ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Recommended size: 200x200px. PNG or JPG.</p>
                </div>

                {/* Bot Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bot Avatar
                  </label>
                  <div className="flex items-center space-x-4">
                    {formData.bot_avatar ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                        <img
                          src={formData.bot_avatar}
                          alt="Bot Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
                      onClick={handleAvatarUpload}
                    >
                      {formData.bot_avatar ? 'Change Avatar' : 'Upload Avatar'}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Recommended size: 200x200px. PNG or JPG. Will be displayed as a circle.</p>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex flex-wrap gap-3">
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
                    {/* Add a "no color" option */}
                    <button
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center ${
                        !formData.accent_color ? 'border-black' : ''
                      }`}
                      onClick={() => handleChange('accent_color', '')}
                    >
                      <span className="text-gray-500 text-xs">×</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-medium text-gray-700">Chat Widget Settings</h3>
                  
                  {/* Branding */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">
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
                    <label className="text-sm text-gray-700">
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
                    <label className="text-sm text-gray-700">
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
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Ensure the User component is imported
const User = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default AppearancePage;