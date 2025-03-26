'use client';

import { useState, useEffect } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams } from 'next/navigation';

const SettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const [agentId, setAgentId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bot_name: '',
    description: '',
    purpose: '',
    use_case_category: '',
    use_case_description: '',
    privacy_level: '',
    model_type: '',
    company_size: '',
    company_type: '',
    target_audience: ''
  });

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

  // Fetch bot settings when agentId is available
  useEffect(() => {
    if (agentId && agentId !== 'unknown') {
      fetchBotSettings();
    }
  }, [agentId]);

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Fetch bot settings from API
  const fetchBotSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await fetch(`/api/bot/${agentId}/settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update form data with retrieved settings
      setFormData({
        bot_name: data.bot_name || '',
        description: data.description || '',
        purpose: data.purpose || '',
        use_case_category: data.use_case_category || '',
        use_case_description: data.use_case_description || '',
        privacy_level: data.privacy_level || '',
        model_type: data.model_type || '',
        company_size: data.company_size || '',
        company_type: data.company_type || '',
        target_audience: data.target_audience || ''
      });
    } catch (error) {
      console.error('Error fetching bot settings:', error);
      setErrorMessage('Failed to load bot settings. Please try again.');
    } finally {
      setIsLoading(false);
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
      const response = await fetch(`/api/bot/${agentId}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save settings: ${response.status}`);
      }
      
      const updatedData = await response.json();
      
      // Update form with the returned data
      setFormData({
        bot_name: updatedData.bot_name || '',
        description: updatedData.description || '',
        purpose: updatedData.purpose || '',
        use_case_category: updatedData.use_case_category || '',
        use_case_description: updatedData.use_case_description || '',
        privacy_level: updatedData.privacy_level || '',
        model_type: updatedData.model_type || '',
        company_size: updatedData.company_size || '',
        company_type: updatedData.company_type || '',
        target_audience: updatedData.target_audience || ''
      });
      
      setSuccessMessage('Settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving bot settings:', error);
      setErrorMessage(error.message || 'Failed to save settings. Please try again.');
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
                <h2 className="text-lg font-medium">General Settings</h2>
                
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
              
              <div className="space-y-4">
                {/* Bot Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bot Name*
                  </label>
                  <input
                    type="text"
                    value={formData.bot_name}
                    onChange={(e) => handleChange('bot_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter bot name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Describe your bot's purpose"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose
                  </label>
                  <textarea
                    value={formData.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="What is the main purpose of this bot?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Use Case Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Use Case Category
                    </label>
                    <input
                      type="text"
                      value={formData.use_case_category}
                      onChange={(e) => handleChange('use_case_category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Customer Support, Sales, etc."
                    />
                  </div>

                  {/* Company Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Size
                    </label>
                    <select
                      value={formData.company_size}
                      onChange={(e) => handleChange('company_size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001+">1001+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Use Case Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Use Case Description
                  </label>
                  <textarea
                    value={formData.use_case_description}
                    onChange={(e) => handleChange('use_case_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Describe the specific use case for this bot"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <input
                      type="text"
                      value={formData.target_audience}
                      onChange={(e) => handleChange('target_audience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., Customers, Employees, etc."
                    />
                  </div>

                  {/* Company Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Type
                    </label>
                    <input
                      type="text"
                      value={formData.company_type}
                      onChange={(e) => handleChange('company_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="e.g., SaaS, E-commerce, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Privacy Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Privacy Level
                    </label>
                    <select
                      value={formData.privacy_level}
                      onChange={(e) => handleChange('privacy_level', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select privacy level</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>

                  {/* Model Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Model
                    </label>
                    <select
                      value={formData.model_type}
                      onChange={(e) => handleChange('model_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select AI model</option>
                      <option value="GPT_3_5_TURBO">GPT-3.5 Turbo</option>
                      <option value="GPT_4">GPT-4</option>
                      <option value="CLAUDE_3_OPUS">Claude 3 Opus</option>
                      <option value="CLAUDE_3_SONNET">Claude 3 Sonnet</option>
                      <option value="CLAUDE_3_HAIKU">Claude 3 Haiku</option>
                      <option value="GEMINI_PRO">Gemini Pro</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors"
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

export default SettingsPage;