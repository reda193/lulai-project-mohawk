'use client';
import { FC, useEffect, useState } from 'react';
import { MoreHorizontalIcon, SettingsIcon, PaletteIcon, PowerIcon, AlertTriangleIcon } from 'lucide-react';

// Types
interface ChatbotConfig {
  id: string;
  clientName: string;
  defaultBehavior: {
    responseDelay: number; // in seconds
    tone: 'formal' | 'friendly' | 'professional';
    language: string;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

interface EmergencyOverride {
  id: string;
  action: 'restart' | 'disable';
  target: 'all' | 'specific';
  clientIds?: string[]; // Only for 'specific' target
  status: 'pending' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
}

// Global Configuration Component
interface GlobalConfigurationProps {
  configs: ChatbotConfig[];
  onUpdateBehavior: (configId: string, newBehavior: ChatbotConfig['defaultBehavior']) => void;
  onUpdateBranding: (configId: string, newBranding: ChatbotConfig['branding']) => void;
}

const GlobalConfiguration: FC<GlobalConfigurationProps> = ({ configs, onUpdateBehavior, onUpdateBranding }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Global Configuration</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {configs.map(config => (
          <div key={config.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{config.clientName}</p>
                <p className="text-sm text-gray-500">
                  Response Delay: {config.defaultBehavior.responseDelay}s
                </p>
                <p className="text-sm text-gray-500">
                  Tone: {config.defaultBehavior.tone.charAt(0).toUpperCase() + config.defaultBehavior.tone.slice(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Language: {config.defaultBehavior.language}
                </p>
                <p className="text-sm text-gray-500">
                  Primary Color: <span style={{ color: config.branding.primaryColor }}>{config.branding.primaryColor}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Secondary Color: <span style={{ color: config.branding.secondaryColor }}>{config.branding.secondaryColor}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newDelay = prompt('Enter new response delay (in seconds):', config.defaultBehavior.responseDelay.toString());
                    const newTone = prompt('Enter new tone (formal, friendly, professional):', config.defaultBehavior.tone);
                    const newLanguage = prompt('Enter new language code (e.g., en, es):', config.defaultBehavior.language);
                    if (newDelay && newTone && newLanguage) {
                      onUpdateBehavior(config.id, {
                        responseDelay: parseInt(newDelay, 10),
                        tone: newTone as ChatbotConfig['defaultBehavior']['tone'],
                        language: newLanguage,
                      });
                    }
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const newPrimaryColor = prompt('Enter new primary color (hex code):', config.branding.primaryColor);
                    const newSecondaryColor = prompt('Enter new secondary color (hex code):', config.branding.secondaryColor);
                    if (newPrimaryColor && newSecondaryColor) {
                      onUpdateBranding(config.id, {
                        ...config.branding,
                        primaryColor: newPrimaryColor,
                        secondaryColor: newSecondaryColor,
                      });
                    }
                  }}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <PaletteIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Emergency Overrides Component
interface EmergencyOverridesProps {
  overrides: EmergencyOverride[];
  onRestartServices: (target: 'all' | 'specific', clientIds?: string[]) => void;
  onDisableChatbots: (target: 'all' | 'specific', clientIds?: string[]) => void;
}

const EmergencyOverrides: FC<EmergencyOverridesProps> = ({ overrides, onRestartServices, onDisableChatbots }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Emergency Overrides</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {overrides.map(override => (
          <div key={override.id} className={`border ${
            override.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-gray-200'
          } rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {override.action === 'restart' ? 'Restart AI Services' : 'Disable Chatbots'}
                </p>
                <p className="text-sm text-gray-500">
                  Target: {override.target === 'all' ? 'All Clients' : 'Specific Clients'}
                </p>
                {override.clientIds && (
                  <p className="text-sm text-gray-500">
                    Client IDs: {override.clientIds.join(', ')}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Status: <span className={`${
                    override.status === 'pending' ? 'text-yellow-600' :
                    override.status === 'completed' ? 'text-green-600' :
                    'text-red-600'
                  }`}>
                    {override.status.charAt(0).toUpperCase() + override.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-500">Initiated At: {override.initiatedAt}</p>
                {override.completedAt && (
                  <p className="text-sm text-gray-500">Completed At: {override.completedAt}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => {
            const target = confirm('Restart AI services for all clients?') ? 'all' : 'specific';
            let clientIds: string[] | undefined;
            if (target === 'specific') {
              const ids = prompt('Enter client IDs (comma-separated):');
              clientIds = ids ? ids.split(',').map(id => id.trim()) : undefined;
            }
            onRestartServices(target, clientIds);
          }}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          <PowerIcon className="w-5 h-5 inline-block mr-2" />
          Restart AI Services
        </button>
        <button
          onClick={() => {
            const target = confirm('Disable chatbots for all clients?') ? 'all' : 'specific';
            let clientIds: string[] | undefined;
            if (target === 'specific') {
              const ids = prompt('Enter client IDs (comma-separated):');
              clientIds = ids ? ids.split(',').map(id => id.trim()) : undefined;
            }
            onDisableChatbots(target, clientIds);
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          <AlertTriangleIcon className="w-5 h-5 inline-block mr-2" />
          Disable Chatbots
        </button>
      </div>
    </div>
  );
};

// Main Component
const SystemManagement: FC = () => { 
  const [configs, setConfigs] = useState<ChatbotConfig[]>([]);
  const [overrides, setOverrides] = useState<EmergencyOverride[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch configs
        const configsResponse = await fetch('/api/admin/configs');
        const configsData = await configsResponse.json();
        
        // Fetch overrides
        const overridesResponse = await fetch('/api/admin/overrides');
        const overridesData = await overridesResponse.json();
        
        // Update state with fetched data
        setConfigs(configsData.configs || []);
        setOverrides(overridesData.overrides || []);
      } catch (error) {
        console.error('Error fetching system data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array ensures this only runs once

  const handleUpdateBehavior = async (configId: string, newBehavior: ChatbotConfig['defaultBehavior']) => {
    try {
      // Optimistic UI update
      setConfigs(prevConfigs => 
        prevConfigs.map(config =>
          config.id === configId ? { ...config, defaultBehavior: newBehavior } : config
        )
      );
      
      // API call to update behavior
      await fetch(`/api/admin/configs/${configId}/behavior`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBehavior)
      });
    } catch (error) {
      console.error('Error updating behavior:', error);
      // You might want to revert the optimistic update or show an error message
    }
  };

  const handleUpdateBranding = async (configId: string, newBranding: ChatbotConfig['branding']) => {
    try {
      // Optimistic UI update
      setConfigs(prevConfigs => 
        prevConfigs.map(config =>
          config.id === configId ? { ...config, branding: newBranding } : config
        )
      );
      
      // API call to update branding
      await fetch(`/api/admin/configs/${configId}/branding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranding)
      });
    } catch (error) {
      console.error('Error updating branding:', error);
      // Handle error appropriately
    }
  };

  const handleRestartServices = async (target: 'all' | 'specific', clientIds?: string[]) => {
    try {
      const newOverrideId = Date.now().toString();
      const initiatedAt = new Date().toISOString();
      
      // Create new override object
      const newOverride: EmergencyOverride = {
        id: newOverrideId,
        action: 'restart',
        target,
        clientIds,
        status: 'pending',
        initiatedAt,
      };
      
      // Optimistic UI update - add the new override
      setOverrides(prev => [...prev, newOverride]);
      
      // API call to initiate restart
      await fetch('/api/admin/overrides/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, clientIds, initiatedAt })
      });
      
      // Simulate completion after 2 seconds (in a real app, you'd handle this with a webhook or polling)
      setTimeout(async () => {
        const completedAt = new Date().toISOString();
        
        // Optimistic UI update for completion
        setOverrides(prev => 
          prev.map(override =>
            override.id === newOverrideId 
              ? { ...override, status: 'completed', completedAt } 
              : override
          )
        );
        
        // API call to update override status
        await fetch(`/api/admin/overrides/${newOverrideId}/complete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedAt })
        });
      }, 2000);
    } catch (error) {
      console.error('Error restarting services:', error);
      // Handle error appropriately
    }
  };

  const handleDisableChatbots = async (target: 'all' | 'specific', clientIds?: string[]) => {
    try {
      const newOverrideId = Date.now().toString();
      const initiatedAt = new Date().toISOString();
      
      // Create new override object
      const newOverride: EmergencyOverride = {
        id: newOverrideId,
        action: 'disable',
        target,
        clientIds,
        status: 'pending',
        initiatedAt,
      };
      
      // Optimistic UI update - add the new override
      setOverrides(prev => [...prev, newOverride]);
      
      // API call to initiate disable
      await fetch('/api/admin/overrides/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, clientIds, initiatedAt })
      });
      
      // Simulate completion after 2 seconds (in a real app, you'd handle this with a webhook or polling)
      setTimeout(async () => {
        const completedAt = new Date().toISOString();
        
        // Optimistic UI update for completion
        setOverrides(prev => 
          prev.map(override =>
            override.id === newOverrideId 
              ? { ...override, status: 'completed', completedAt } 
              : override
          )
        );
        
        // API call to update override status
        await fetch(`/api/admin/overrides/${newOverrideId}/complete`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completedAt })
        });
      }, 2000);
    } catch (error) {
      console.error('Error disabling chatbots:', error);
      // Handle error appropriately
    }
  };

  if (loading) {
    return <div className="p-6">Loading system management data...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Management</h1>

      <GlobalConfiguration
        configs={configs}
        onUpdateBehavior={handleUpdateBehavior}
        onUpdateBranding={handleUpdateBranding}
      />

      <EmergencyOverrides
        overrides={overrides}
        onRestartServices={handleRestartServices}
        onDisableChatbots={handleDisableChatbots}
      />
    </div>
  );
};

export default SystemManagement;