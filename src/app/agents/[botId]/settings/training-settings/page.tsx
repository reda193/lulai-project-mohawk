'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, PlusIcon, TrashIcon } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams } from 'next/navigation';

interface CustomPrompt {
  prompt_type: string;
  prompt_content: string;
  category: string;
  context: string;
}

interface QAPair {
  question: string;
  answer: string;
  category: string;
}

interface TrainingData {
  training_data: QAPair[];
  custom_prompts: CustomPrompt[];
}

const TrainingSettingsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const params = useParams();
  const [agentId, setAgentId] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'qa' | 'prompts'>('prompts');
  const [formData, setFormData] = useState<TrainingData>({
    training_data: [],
    custom_prompts: []
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

  const handleAddPrompt = () => {
    setFormData(prev => ({
      ...prev,
      custom_prompts: [
        ...prev.custom_prompts,
        {
          prompt_type: '',
          prompt_content: '',
          category: '',
          context: ''
        }
      ]
    }));
  };

  const handleAddQA = () => {
    setFormData(prev => ({
      ...prev,
      training_data: [
        ...prev.training_data,
        {
          question: '',
          answer: '',
          category: ''
        }
      ]
    }));
  };

  const handlePromptChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newPrompts = [...prev.custom_prompts];
      newPrompts[index] = {
        ...newPrompts[index],
        [field]: value
      };
      
      return {
        ...prev,
        custom_prompts: newPrompts
      };
    });
  };

  const handleQAChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newQAPairs = [...prev.training_data];
      newQAPairs[index] = {
        ...newQAPairs[index],
        [field]: value
      };
      
      return {
        ...prev,
        training_data: newQAPairs
      };
    });
  };

  const handleRemovePrompt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      custom_prompts: prev.custom_prompts.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveQA = (index: number) => {
    setFormData(prev => ({
      ...prev,
      training_data: prev.training_data.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
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
            <h2 className="text-lg font-medium">Training Settings</h2>

            {/* Section Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                type="button"
                className={`px-4 py-2 border-b-2 ${
                  activeSection === 'prompts'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveSection('prompts')}
              >
                Custom Prompts
              </button>
              <button
                type="button"
                className={`px-4 py-2 border-b-2 ${
                  activeSection === 'qa'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500'
                }`}
                onClick={() => setActiveSection('qa')}
              >
                Q&A Pairs
              </button>
            </div>

            {/* Custom Prompts Section */}
            {activeSection === 'prompts' && (
              <div className="space-y-4">
                {formData.custom_prompts.map((prompt, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prompt Type
                          </label>
                          <select
                            value={prompt.prompt_type}
                            onChange={(e) => handlePromptChange(index, 'prompt_type', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Select prompt type</option>
                            <option value="greeting">Greeting</option>
                            <option value="response">Response</option>
                            <option value="clarification">Clarification</option>
                            <option value="followup">Follow-up</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prompt Content
                          </label>
                          <textarea
                            value={prompt.prompt_content}
                            onChange={(e) => handlePromptChange(index, 'prompt_content', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Enter prompt content"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={prompt.category}
                            onChange={(e) => handlePromptChange(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter category (optional)"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Context
                          </label>
                          <textarea
                            value={prompt.context}
                            onChange={(e) => handlePromptChange(index, 'context', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={2}
                            placeholder="Enter additional context (optional)"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrompt(index)}
                        className="ml-4 text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddPrompt}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Custom Prompt</span>
                </button>
              </div>
            )}

            {/* Q&A Pairs Section */}
            {activeSection === 'qa' && (
              <div className="space-y-4">
                {formData.training_data.map((qa, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={qa.question}
                            onChange={(e) => handleQAChange(index, 'question', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter question"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Answer
                          </label>
                          <textarea
                            value={qa.answer}
                            onChange={(e) => handleQAChange(index, 'answer', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="Enter answer"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={qa.category}
                            onChange={(e) => handleQAChange(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter category (optional)"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQA(index)}
                        className="ml-4 text-gray-400 hover:text-red-500"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddQA}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Add Q&A Pair</span>
                </button>
              </div>
            )}

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

export default TrainingSettingsPage;