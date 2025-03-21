// components/CreateAgent/AppearanceSettings.tsx
import { FC } from 'react';
import ChatbotPreview from './ChatbotPreview';
interface AppearanceSettingsProps {
  formData: any;
  onChange: (data: any) => void;
}

const AppearanceSettings: FC<AppearanceSettingsProps> = ({ formData, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const handleLogoUpload = () => {
    // Trigger file upload for company logo
    onChange({ company_logo_upload: true });
  };

  const handleAvatarUpload = () => {
    // Trigger file upload for bot avatar
    onChange({ bot_avatar_upload: true });
  };

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

  const colors = [
    '#DC2626', '#EA580C', '#EAB308', '#84CC16', '#10B981', 
    '#00A3FF', '#2563EB', '#7C3AED', '#EC4899'
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Settings Column */}
      <div className="flex-1 space-y-6">
        <h2 className="text-lg font-medium">Appearance Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.company_logo && (
                <img
                  src={formData.company_logo}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bot Avatar
            </label>
            <div className="flex items-center space-x-4">
              {formData.bot_avatar && (
                <img
                  src={formData.bot_avatar}
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

          <div className="space-y-4">
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
      </div>

      {/* Preview Column */}
      <div className="md:w-72">
        <div className="sticky top-8">
          <h2 className="text-lg font-medium mb-4">Live Preview</h2>
          <ChatbotPreview formData={formData} />
          <div className="mt-4 text-xs text-gray-500">
            <p className="mb-2">This preview shows how your chatbot will appear to your users.</p>
            <p>Click the widget button to toggle between open and closed states.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;