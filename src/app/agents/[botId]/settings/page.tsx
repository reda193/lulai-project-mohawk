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
  const [formData, setFormData] = useState({
    bot_name: '',
    description: '',
    purpose: '',
    use_case_category: '',
    use_case_description: '',
    privacy_level: ''
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

  // Handle input changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
            <h2 className="text-lg font-medium">General Settings</h2>
            
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

export default SettingsPage;