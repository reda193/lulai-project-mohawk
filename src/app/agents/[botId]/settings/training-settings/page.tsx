'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, PlusIcon, TrashIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { useParams } from 'next/navigation';

interface CustomPrompt {
  id?: number | string;
  prompt_type: string;
  prompt_content: string;
  category: string;
  context: string;
}

interface QAPair {
  id?: string;
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
  
  // API state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  // Fetch data when agent ID is available
  useEffect(() => {
    if (agentId && agentId !== 'unknown') {
      fetchTrainingData();
    }
  }, [agentId]);

  // Fetch training data from API
  const fetchTrainingData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Fetch custom prompts
      const promptsResponse = await fetch(`/api/bot/${agentId}/training/prompts`);
      
      if (!promptsResponse.ok) {
        throw new Error(`Failed to fetch prompts: ${promptsResponse.status}`);
      }
      
      const promptsData = await promptsResponse.json();
      
      // Fetch Q&A pairs
      const qaResponse = await fetch(`/api/bot/${agentId}/training/qa`);
      
      if (!qaResponse.ok) {
        throw new Error(`Failed to fetch Q&A pairs: ${qaResponse.status}`);
      }
      
      const qaData = await qaResponse.json();
      
      // Update form data with retrieved settings
      setFormData({
        custom_prompts: promptsData.custom_prompts || [],
        training_data: qaData.training_data || []
      });
    } catch (error) {
      console.error('Error fetching training data:', error);
      setErrorMessage('Failed to load training data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add new prompt to the form
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
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Add new Q&A pair to the form
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
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Handle changes to a prompt
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
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Handle changes to a Q&A pair
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
    
    // Clear any success message when form is edited
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Remove a prompt from the form
  const handleRemovePrompt = async (index: number) => {
    const prompt = formData.custom_prompts[index];
    
    // If the prompt has an ID, it exists in the database and should be deleted via API
    if (prompt.id) {
      try {
        setIsSaving(true);
        const response = await fetch(`/api/bot/${agentId}/training/prompts?promptId=${prompt.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete prompt: ${response.status}`);
        }
        
        // Remove from local state if deletion was successful
        setFormData(prev => ({
          ...prev,
          custom_prompts: prev.custom_prompts.filter((_, i) => i !== index)
        }));
        
        setSuccessMessage('Prompt deleted successfully');
      } catch (error) {
        console.error('Error deleting prompt:', error);
        setErrorMessage('Failed to delete prompt. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // If the prompt doesn't have an ID, it only exists locally and can be removed from state
      setFormData(prev => ({
        ...prev,
        custom_prompts: prev.custom_prompts.filter((_, i) => i !== index)
      }));
    }
  };

  // Remove a Q&A pair from the form
  const handleRemoveQA = async (index: number) => {
    const qa = formData.training_data[index];
    
    // If the Q&A pair has an ID, it exists in the database and should be deleted via API
    if (qa.id) {
      try {
        setIsSaving(true);
        const response = await fetch(`/api/bot/${agentId}/training/qa?qaId=${qa.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete Q&A pair: ${response.status}`);
        }
        
        // Remove from local state if deletion was successful
        setFormData(prev => ({
          ...prev,
          training_data: prev.training_data.filter((_, i) => i !== index)
        }));
        
        setSuccessMessage('Q&A pair deleted successfully');
      } catch (error) {
        console.error('Error deleting Q&A pair:', error);
        setErrorMessage('Failed to delete Q&A pair. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // If the Q&A pair doesn't have an ID, it only exists locally and can be removed from state
      setFormData(prev => ({
        ...prev,
        training_data: prev.training_data.filter((_, i) => i !== index)
      }));
    }
  };

  // Submit the form data to the API
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
      // Separate API calls based on active section
      if (activeSection === 'prompts') {
        // Save custom prompts
        const response = await fetch(`/api/bot/${agentId}/training/prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            custom_prompts: formData.custom_prompts,
            replace_all: false // Don't delete existing prompts that weren't modified
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save prompts: ${response.status}`);
        }
        
        const updatedData = await response.json();
        
        // Update form with the returned data
        setFormData(prev => ({
          ...prev,
          custom_prompts: updatedData.custom_prompts || prev.custom_prompts
        }));
        
        setSuccessMessage('Custom prompts saved successfully!');
      } else if (activeSection === 'qa') {
        // Save Q&A pairs
        const response = await fetch(`/api/bot/${agentId}/training/qa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            training_data: formData.training_data,
            replace_all: false // Don't delete existing Q&A pairs that weren't modified
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to save Q&A pairs: ${response.status}`);
        }
        
        const updatedData = await response.json();
        
        // Update form with the returned data
        setFormData(prev => ({
          ...prev,
          training_data: updatedData.training_data || prev.training_data
        }));
        
        setSuccessMessage('Q&A pairs saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving training data:', error);
      setErrorMessage(error.message || 'Failed to save training data. Please try again.');
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
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-gray-400 animate-spin mb-2" />
                <p className="text-gray-500">Loading training data...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 m-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Training Settings</h2>
                
                {/* Success Message */}
                {successMessage && (
                  <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {successMessage}
                  </div>
                )}
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errorMessage}
                  </div>
                )}
              </div>

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
                  {formData.custom_prompts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No custom prompts added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddPrompt}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add your first prompt</span>
                      </button>
                    </div>
                  ) : (
                    formData.custom_prompts.map((prompt, index) => (
                      <div key={prompt.id || `new-prompt-${index}`} className="p-4 border border-gray-200 rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prompt Type<span className="text-red-500">*</span>
                              </label>
                              <select
                                value={prompt.prompt_type}
                                onChange={(e) => handlePromptChange(index, 'prompt_type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
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
                                Prompt Content<span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={prompt.prompt_content}
                                onChange={(e) => handlePromptChange(index, 'prompt_content', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Enter prompt content"
                                required
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
                            className="ml-4 text-gray-400 hover:text-red-500 disabled:opacity-50"
                            disabled={isSaving}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {formData.custom_prompts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddPrompt}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Custom Prompt</span>
                    </button>
                  )}
                </div>
              )}

              {/* Q&A Pairs Section */}
              {activeSection === 'qa' && (
                <div className="space-y-4">
                  {formData.training_data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-gray-300 rounded-lg">
                      <p className="text-gray-500 mb-4">No Q&A pairs added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddQA}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                      >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add your first Q&A pair</span>
                      </button>
                    </div>
                  ) : (
                    formData.training_data.map((qa, index) => (
                      <div key={qa.id || `new-qa-${index}`} className="p-4 border border-gray-200 rounded-lg space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question<span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={qa.question}
                                onChange={(e) => handleQAChange(index, 'question', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Enter question"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Answer<span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={qa.answer}
                                onChange={(e) => handleQAChange(index, 'answer', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                rows={3}
                                placeholder="Enter answer"
                                required
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
                            className="ml-4 text-gray-400 hover:text-red-500 disabled:opacity-50"
                            disabled={isSaving}
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {formData.training_data.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddQA}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                    >
                      <PlusIcon className="w-5 h-5" />
                      <span>Add Q&A Pair</span>
                    </button>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingSettingsPage;