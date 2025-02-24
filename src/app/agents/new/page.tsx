'use client';

import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import BasicSettings from '@/components/CreateAgent/BasicSettings';
import AppearanceSettings from '@/components/CreateAgent/AppearanceSettings';
import TrainingSettings from '@/components/CreateAgent/TrainingSettings';

type TabType = 'Settings' | 'Training' | 'Workflows' | 'Integrations';

const CreateAgent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('Settings');
  const [formData, setFormData] = useState({
    // Basic Settings
    bot_name: '',
    description: '',
    purpose: '',
    company_size: '',
    company_type: '',
    use_case_category: '',
    use_case_description: '',
    target_audience: '',
    privacy_level: '',
    model_type: 'GPT_3_5_TURBO',

    // Appearance
    company_logo: '',
    bot_avatar: '',
    accent_color: '#00A3FF',
    widget_icon: 'default',
    widget_position: 'bottom-right',
    input_placeholder: 'Send a message...',
    branding_enabled: true,
    widget_open_by_default: false,
    starter_questions: true,

    // Training
    training_data: [] as { question: string; answer: string; category?: string }[],
    custom_prompts: [] as { prompt_type: string; prompt_content: string; category?: string; context?: string }[]
  });

  const handleChange = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleSubmit = async () => {
    try {
      // API call to create bot would go here
      console.log('Submitting bot data:', formData);
    } catch (error) {
      console.error('Error creating bot:', error);
    }
  };

  const navItems: TabType[] = ['Settings', 'Training', 'Workflows', 'Integrations'];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Settings':
        return (
          <div className="space-y-8">
            <BasicSettings 
              formData={formData}
              onChange={(data) => handleChange('basic', data)}
            />
            <AppearanceSettings
              formData={formData}
              onChange={(data) => handleChange('appearance', data)}
            />
          </div>
        );
      case 'Training':
        return (
          <TrainingSettings
            formData={formData}
            onChange={(data) => handleChange('training', data)}
          />
        );
      default:
        return <div className="py-8 text-center text-gray-500">Coming Soon</div>;
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
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-2xl font-semibold mb-6">New Agent</h1>
          
          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`
                  px-4 py-2 rounded-full
                  ${activeTab === item 
                    ? 'bg-black text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                `}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            {renderActiveTab()}
          </div>

          {/* Action Buttons - Below Content */}
          <div className="bg-white mt-4">
            <div className="border-t border-gray-100 p-4">
              <div className="flex justify-end space-x-3">
                <button
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                  onClick={handleSubmit}
                >
                  Create Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;