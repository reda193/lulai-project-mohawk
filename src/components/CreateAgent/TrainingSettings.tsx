// components/CreateAgent/TrainingSettings.tsx
import { FC, useState } from 'react';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface TrainingSettingsProps {
  formData: any;
  onChange: (data: any) => void;
}

const TrainingSettings: FC<TrainingSettingsProps> = ({ formData, onChange }) => {
  const [activeSection, setActiveSection] = useState<'qa' | 'prompts'>('qa');

  const handleAddQA = () => {
    const newTrainingData = [...formData.training_data, {
      question: '',
      answer: '',
      category: ''
    }];
    onChange({ ...formData, training_data: newTrainingData });
  };

  const handleAddPrompt = () => {
    const newPrompts = [...formData.custom_prompts, {
      prompt_type: '',
      prompt_content: '',
      category: '',
      context: ''
    }];
    onChange({ ...formData, custom_prompts: newPrompts });
  };

  const handleQAChange = (index: number, field: string, value: string) => {
    const newTrainingData = [...formData.training_data];
    newTrainingData[index] = {
      ...newTrainingData[index],
      [field]: value
    };
    onChange({ ...formData, training_data: newTrainingData });
  };

  const handlePromptChange = (index: number, field: string, value: string) => {
    const newPrompts = [...formData.custom_prompts];
    newPrompts[index] = {
      ...newPrompts[index],
      [field]: value
    };
    onChange({ ...formData, custom_prompts: newPrompts });
  };

  const handleRemoveQA = (index: number) => {
    const newTrainingData = formData.training_data.filter((_: any, i: number) => i !== index);
    onChange({ ...formData, training_data: newTrainingData });
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = formData.custom_prompts.filter((_: any, i: number) => i !== index);
    onChange({ ...formData, custom_prompts: newPrompts });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Training Settings</h2>

      {/* Section Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 border-b-2 ${
            activeSection === 'qa'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveSection('qa')}
        >
          Q&A Pairs
        </button>
        <button
          className={`px-4 py-2 border-b-2 ${
            activeSection === 'prompts'
              ? 'border-black text-black'
              : 'border-transparent text-gray-500'
          }`}
          onClick={() => setActiveSection('prompts')}
        >
          Custom Prompts
        </button>
      </div>

      {/* Q&A Section */}
      {activeSection === 'qa' && (
        <div className="space-y-4">
          {formData.training_data.map((item: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question
                    </label>
                    <input
                      type="text"
                      value={item.question}
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
                      value={item.answer}
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
                      value={item.category}
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

      {/* Custom Prompts Section */}
      {activeSection === 'prompts' && (
        <div className="space-y-4">
          {formData.custom_prompts.map((prompt: any, index: number) => (
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
    </div>
  );
};

export default TrainingSettings;