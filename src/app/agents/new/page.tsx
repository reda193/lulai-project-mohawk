'use client';

import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { MenuIcon, ArrowLeft, ArrowRight, Check, Upload, Info, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import BasicSettings from '@/components/CreateAgent/BasicSettings';
import AppearanceSettings from '@/components/CreateAgent/AppearanceSettings';
import TrainingSettings from '@/components/CreateAgent/TrainingSettings';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

type StepType = 'basic' | 'appearance' | 'training';

// Define proper types for formData
interface FormData {
  // Basic Settings
  bot_name: string;
  description: string;
  purpose: string;
  company_size: string;
  company_type: string;
  use_case_category: string;
  use_case_description: string;
  target_audience: string;
  privacy_level: string;
  model_type: string;

  // Appearance
  company_logo: string;
  bot_avatar: string;
  accent_color: string;
  widget_icon: string;
  widget_position: string;
  input_placeholder: string;
  branding_enabled: boolean;
  widget_open_by_default: boolean;
  starter_questions: boolean;

  // Training
  training_data: Array<{ 
    question: string; 
    answer: string; 
    category?: string 
  }>;
  custom_prompts: Array<{ 
    prompt_type: string; 
    prompt_content: string; 
    category?: string; 
    context?: string 
  }>;
}

const CreateAgent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<StepType>('basic');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { data: session } = useSession();

  // Refs for file inputs
  const companyLogoInputRef = useRef<HTMLInputElement>(null);
  const botAvatarInputRef = useRef<HTMLInputElement>(null);

  // Track files for upload when submitting
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
    training_data: [],
    custom_prompts: []
  });

  // Check if existing agent ID is in localStorage
  useEffect(() => {
    const savedAgentId = localStorage.getItem('createdAgentId');
    if (savedAgentId) {
      setCreatedAgentId(savedAgentId);
    }
  }, []);

  // Handle form data changes with debounce for better performance
  const handleChange = (data: Partial<FormData>) => {
    // If the change is for files, update immediately
    if (data.company_logo || data.bot_avatar) {
      setFormData(prev => ({
        ...prev,
        ...data
      }));
      return;
    }
    
    // For other form changes, update normally
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // File upload handler for previewing files
  const handleFileUpload = (
    event: ChangeEvent<HTMLInputElement>, 
    field: 'company_logo' | 'bot_avatar'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({...prev, [field]: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.'}));
      return;
    }
  
    if (file.size > maxSize) {
      setErrors(prev => ({...prev, [field]: 'File is too large. Maximum size is 5MB.'}));
      return;
    }
  
    // Store the file for later upload
    if (field === 'company_logo') {
      setLogoFile(file);
    } else {
      setAvatarFile(file);
    }
  
    // Create an object URL instead of a data URL
    // This is more memory efficient as it doesn't load the entire file into memory
    const objectUrl = URL.createObjectURL(file);
    
    // Update form data with the URL
    setFormData(prev => ({
      ...prev,
      [field]: objectUrl
    }));
  
    // Clear any errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Don't forget to revoke object URLs when no longer needed
  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (formData.company_logo && formData.company_logo.startsWith('blob:')) {
        URL.revokeObjectURL(formData.company_logo);
      }
      if (formData.bot_avatar && formData.bot_avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.bot_avatar);
      }
    };
  }, []);

  // File removal handler
  const handleFileRemove = (field: 'company_logo' | 'bot_avatar') => {
    // Revoke the object URL if it exists
    if (field === 'company_logo' && formData.company_logo.startsWith('blob:')) {
      URL.revokeObjectURL(formData.company_logo);
    } else if (field === 'bot_avatar' && formData.bot_avatar.startsWith('blob:')) {
      URL.revokeObjectURL(formData.bot_avatar);
    }
    
    // Clear the file
    if (field === 'company_logo') {
      setLogoFile(null);
    } else {
      setAvatarFile(null);
    }

    // Update form data to remove the file
    handleChange({ 
      [field]: '' 
    });

    // Clear any previous errors for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }

    // Reset file input
    if (field === 'company_logo' && companyLogoInputRef.current) {
      companyLogoInputRef.current.value = '';
    } else if (field === 'bot_avatar' && botAvatarInputRef.current) {
      botAvatarInputRef.current.value = '';
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 'basic') {
      if (!formData.bot_name || !formData.bot_name.trim()) {
        newErrors.bot_name = 'Bot name is required';
      }
      if (!formData.description || !formData.description.trim()) {
        newErrors.description = 'Description is required';
      }
      if (!formData.purpose || !formData.purpose.trim()) {
        newErrors.purpose = 'Purpose is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create bot with all the collected data - Called only when clicking "Finish"
  const submitAgent = async () => {
    if (!validateStep()) {
      return;
    }
    
    setIsProcessing(true);
    setErrors({});
    
    try {
      // Step 1: Create the bot
      setStatusMessage('Creating bot...');
      console.log('Creating bot...');
      
      const basicInfo = {
        bot_name: formData.bot_name,
        description: formData.description,
        purpose: formData.purpose,
        company_size: formData.company_size,
        company_type: formData.company_type,
        use_case_category: formData.use_case_category,
        use_case_description: formData.use_case_description,
        target_audience: formData.target_audience,
        privacy_level: formData.privacy_level,
        model_type: formData.model_type
      };
      
      const createResponse = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basicInfo)
      });
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || 'Failed to create bot');
        } catch (e) {
          throw new Error(`Failed to create bot: ${errorText.substring(0, 100)}`);
        }
      }
      
      const botData = await createResponse.json();
      const botId = botData.bot?.id;
      
      if (!botId) {
        throw new Error('No bot ID returned from API');
      }
      
      setCreatedAgentId(botId);
      localStorage.setItem('createdAgentId', botId);
      console.log('Bot created with ID:', botId);
      
      // Step 2: Upload appearance files
      if (logoFile || avatarFile) {
        setStatusMessage('Uploading files...');
        console.log('Uploading files...');
        
        const fileFormData = new FormData();
        if (logoFile) fileFormData.append('company_logo', logoFile);
        if (avatarFile) fileFormData.append('bot_avatar', avatarFile);
        
        const fileResponse = await fetch(`/api/bot/${botId}/appearance`, {
          method: 'POST',
          body: fileFormData
        });
        
        if (!fileResponse.ok) {
          const errorText = await fileResponse.text();
          console.error('File upload error response:', errorText);
          // Continue despite file upload errors
        } else {
          console.log('Files uploaded successfully');
        }
      }
      
      // Step 3: Update appearance settings
      setStatusMessage('Updating appearance...');
      console.log('Updating appearance settings...');
      
      const appearanceFormData = new FormData();
      
      // Add all appearance settings to FormData
      if (formData.accent_color) 
        appearanceFormData.append('accent_color', formData.accent_color);
      if (formData.widget_icon) 
        appearanceFormData.append('widget_icon', formData.widget_icon);
      if (formData.widget_position) 
        appearanceFormData.append('widget_position', formData.widget_position);
      if (formData.input_placeholder) 
        appearanceFormData.append('input_placeholder', formData.input_placeholder);
      
      // Boolean values need to be converted to strings for FormData
      appearanceFormData.append('branding_enabled', formData.branding_enabled.toString());
      appearanceFormData.append('widget_open_by_default', formData.widget_open_by_default.toString());
      appearanceFormData.append('starter_questions', formData.starter_questions.toString());
      
      const appearanceResponse = await fetch(`/api/bot/${botId}/appearance`, {
        method: 'POST',
        body: appearanceFormData
      });
      
      if (!appearanceResponse.ok) {
        console.error('Appearance update error:', await appearanceResponse.text());
        // Continue despite appearance errors
      } else {
        console.log('Appearance settings updated successfully');
      }
      
      // Step 4: Add training data (QA items)
      if (formData.training_data.length > 0) {
        setStatusMessage('Adding training Q&A data...');
        console.log('Adding Q&A items...');
        
        // Send all QA items as a batch if possible, otherwise one by one
        try {
          // Try batch first
          const qaResponse = await fetch(`/api/bot/${botId}/qa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.training_data)
          });
          
          if (!qaResponse.ok) {
            // If batch fails, try one by one
            console.log('Batch QA failed, trying individual items...');
            
            for (const item of formData.training_data) {
              await fetch(`/api/bot/${botId}/qa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              });
            }
          }
          
          console.log('QA data added successfully');
        } catch (error) {
          console.error('Error adding QA data:', error);
          // Continue despite QA errors
        }
      }
      
      // Step 5: Add custom prompts
      if (formData.custom_prompts.length > 0) {
        setStatusMessage('Adding custom prompts...');
        console.log('Adding custom prompts...');
        
        try {
          // Try batch first
          const promptsResponse = await fetch(`/api/bot/${botId}/training`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.custom_prompts)
          });
          
          if (!promptsResponse.ok) {
            // If batch fails, try one by one
            console.log('Batch training failed, trying individual items...');
            
            for (const item of formData.custom_prompts) {
              await fetch(`/api/bot/${botId}/training`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              });
            }
          }
          
          console.log('Custom prompts added successfully');
        } catch (error) {
          console.error('Error adding custom prompts:', error);
          // Continue despite custom prompt errors
        }
      }
      
      // Success - redirect to dashboard instead of agent detail page
      setStatusMessage('Bot created successfully! Redirecting to dashboard...');
      console.log('All done! Redirecting to dashboard...');
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        window.location.href = '/dashboard';  // Changed to redirect to dashboard
      }, 1000);
      
    } catch (error: any) {
      console.error('Error creating agent:', error);
      setErrors({ 
        api: error.message || 'Failed to create agent. Please try again.' 
      });
      setStatusMessage('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (validateStep()) {
      if (currentStep === 'basic') {
        setCurrentStep('appearance');
      } else if (currentStep === 'appearance') {
        setCurrentStep('training');
      } else if (currentStep === 'training') {
        // Final submission - create the agent
        submitAgent();
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep === 'appearance') {
      setCurrentStep('basic');
    } else if (currentStep === 'training') {
      setCurrentStep('appearance');
    }
  };

  const renderStepContent = () => {
    if (currentStep === 'basic') {
      return (
        <BasicSettings 
          formData={formData}
          onChange={handleChange}
        />
      );
    } else if (currentStep === 'appearance') {
      return (
        <>
          {/* Hidden file inputs */}
          <input 
            type="file" 
            ref={companyLogoInputRef}
            className="hidden" 
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileUpload(e, 'company_logo')}
          />
          <input 
            type="file" 
            ref={botAvatarInputRef}
            className="hidden" 
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileUpload(e, 'bot_avatar')}
          />

          {/* Create a clone of AppearanceSettings with modified button handlers */}
          <AppearanceSettings
            formData={formData}
            onChange={(data) => {
              if (data.company_logo_upload) {
                companyLogoInputRef.current?.click();
              } else if (data.bot_avatar_upload) {
                botAvatarInputRef.current?.click();
              } else {
                handleChange(data);
              }
            }}
          />
          
          {/* Image Preview and Remove Sections */}
          {formData.company_logo && (
            <div className="mt-4 flex items-center space-x-4">
              <img
                src={formData.company_logo}
                alt="Company Logo"
                className="w-20 h-20 object-contain"
              />
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => handleFileRemove('company_logo')}
              >
                Remove Logo
              </button>
            </div>
          )}

          {formData.bot_avatar && (
            <div className="mt-4 flex items-center space-x-4">
              <img
                src={formData.bot_avatar}
                alt="Bot Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                onClick={() => handleFileRemove('bot_avatar')}
              >
                Remove Avatar
              </button>
            </div>
          )}

          {/* Error Messages */}
          {errors.company_logo && (
            <p className="mt-2 text-sm text-red-600">
              {errors.company_logo}
            </p>
          )}
          {errors.bot_avatar && (
            <p className="mt-2 text-sm text-red-600">
              {errors.bot_avatar}
            </p>
          )}
        </>
      );
    } else if (currentStep === 'training') {
      return (
        <TrainingSettings
          formData={formData}
          onChange={handleChange}
        />
      );
    }
  };

  // Step indicators component
  const StepIndicators = () => (
    <div className="flex items-center justify-center mb-8 mt-4">
      {[
        { key: 'basic', label: 'Basic Info' },
        { key: 'appearance', label: 'Appearance' },
        { key: 'training', label: 'Training' }
      ].map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div 
            className={`flex flex-col items-center ${
              currentStep === step.key ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                currentStep === step.key 
                  ? 'bg-blue-600 text-white' 
                  : (currentStep === 'appearance' && step.key === 'basic') || 
                    (currentStep === 'training' && (step.key === 'basic' || step.key === 'appearance'))
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {(currentStep === 'appearance' && step.key === 'basic') || 
               (currentStep === 'training' && (step.key === 'basic' || step.key === 'appearance')) ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className="text-sm font-medium">
              {step.label}
            </span>
          </div>
          
          {index < 2 && (
            <div className={`w-16 h-1 mx-2 ${
              (index === 0 && currentStep !== 'basic') || 
              (index === 1 && currentStep === 'training')
                ? 'bg-green-500'
                : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

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
        userName={session?.user ? {
          firstName: session.user.first_name || '',
          lastName: session.user.last_name || ''
        } : undefined}
      />

      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
      `}>
        <div className="max-w-4xl mx-auto p-8">
          <h1 className="text-2xl font-semibold mb-6">New Agent</h1>
          
          {/* Processing status message */}
          {statusMessage && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
              <Info className="w-5 h-5 mr-2" />
              <span>{statusMessage}</span>
            </div>
          )}
          
          {/* Step Indicators */}
          <StepIndicators />

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            {errors.api && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {errors.api}
              </div>
            )}
            
            {renderStepContent()}
          </div>

          {/* Action Buttons */}
          <div className="bg-white mt-4">
            <div className="border-t border-gray-100 p-4">
              <div className="flex justify-between space-x-3">
                {/* Back button */}
                <button
                  className={`px-6 py-2 flex items-center ${
                    currentStep === 'basic' || isProcessing
                      ? 'text-gray-400 cursor-not-allowed invisible' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  } rounded-md`}
                  onClick={goToPrevStep}
                  disabled={currentStep === 'basic' || isProcessing}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>

                {/* Next/Create/Finish button */}
                <div className="flex space-x-3">
                  <button
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    onClick={() => window.history.back()}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>

                  <button
                    className={`px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={goToNextStep}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : (
                      <>
                        {currentStep === 'training' 
                          ? 'Finish' 
                          : 'Continue'
                        }
                        {currentStep !== 'training' && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Debug toggle */}
          <div className="mt-4 text-right">
            <button 
              className="text-xs text-gray-500 underline"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>

          {/* Debug info - more comprehensive */}
          {showDebugInfo && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
              <div><strong>Current Step:</strong> {currentStep}</div>
              <div><strong>Is Processing:</strong> {isProcessing ? 'Yes' : 'No'}</div>
              <div><strong>Status:</strong> {statusMessage || 'None'}</div>
              <div><strong>Logo File:</strong> {logoFile ? logoFile.name : 'None'}</div>
              <div><strong>Avatar File:</strong> {avatarFile ? avatarFile.name : 'None'}</div>
              <div><strong>Form Data:</strong></div>
              <pre className="mt-2 p-2 bg-gray-200 rounded overflow-auto max-h-40">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAgent;