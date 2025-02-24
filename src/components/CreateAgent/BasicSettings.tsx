// components/CreateAgent/BasicSettings.tsx
import { FC } from 'react';

interface BasicSettingsProps {
  formData: any;
  onChange: (data: any) => void;
}

const BasicSettings: FC<BasicSettingsProps> = ({ formData, onChange }) => {
  const handleChange = (field: string, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const companySizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201-500 employees',
    '500+ employees'
  ];

  const companyTypes = [
    'Startup',
    'Small Business',
    'Enterprise',
    'Agency',
    'Other'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Basic Information</h2>
      
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Size
            </label>
            <select
              value={formData.company_size}
              onChange={(e) => handleChange('company_size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select size</option>
              {companyTypes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Type
            </label>
            <select
              value={formData.company_type}
              onChange={(e) => handleChange('company_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select type</option>
              {companyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Audience
          </label>
          <input
            type="text"
            value={formData.target_audience}
            onChange={(e) => handleChange('target_audience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Who is this bot designed for?"
          />
        </div>

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Type
          </label>
          <select
            value={formData.model_type}
            onChange={(e) => handleChange('model_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="GPT_3_5_TURBO">GPT-3.5 Turbo</option>
            <option value="GPT_4">GPT-4</option>
            <option value="CLAUDE">Claude</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BasicSettings;