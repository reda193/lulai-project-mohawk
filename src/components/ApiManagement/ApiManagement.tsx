'use client';
import { FC, useState } from 'react';
import { MoreHorizontalIcon, KeyIcon, ActivityIcon, PlugIcon, AlertCircleIcon, TrashIcon } from 'lucide-react';

// Types
interface ApiKey {
  id: string;
  clientName: string;
  apiKey: string;
  createdAt: string;
  status: 'active' | 'revoked';
  usageLimit?: number; // Requests per month
  usageCount?: number; // Current usage
}

interface ThirdPartyIntegration {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'shopify' | 'woocommerce';
  clientName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
  errorMessage?: string;
}

// API Access Control Component
interface ApiAccessControlProps {
  apiKeys: ApiKey[];
  onIssueKey: (clientName: string) => void;
  onRevokeKey: (keyId: string) => void;
  onEditLimit: (keyId: string, newLimit: number) => void;
}

const ApiAccessControl: FC<ApiAccessControlProps> = ({ apiKeys, onIssueKey, onRevokeKey, onEditLimit }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">API Access Control</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map(key => (
          <div key={key.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{key.clientName}</p>
                <p className="text-sm text-gray-500">API Key: {key.apiKey}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className={`${
                    key.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Usage: {key.usageCount || 0} / {key.usageLimit || 'Unlimited'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newLimit = prompt('Set new usage limit (requests per month):', key.usageLimit?.toString() || '');
                    if (newLimit !== null) onEditLimit(key.id, parseInt(newLimit, 10));
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ActivityIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onRevokeKey(key.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => {
            const clientName = prompt('Enter client name:');
            if (clientName) onIssueKey(clientName);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <KeyIcon className="w-5 h-5 inline-block mr-2" />
          Issue New API Key
        </button>
      </div>
    </div>
  );
};

// Third-Party Integrations Component
interface ThirdPartyIntegrationsProps {
  integrations: ThirdPartyIntegration[];
  onReconnect: (integrationId: string) => void;
  onDisconnect: (integrationId: string) => void;
  onTroubleshoot: (integrationId: string) => void;
}

const ThirdPartyIntegrations: FC<ThirdPartyIntegrationsProps> = ({
  integrations,
  onReconnect,
  onDisconnect,
  onTroubleshoot,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Third-Party Integrations</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {integrations.map(integration => (
          <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{integration.clientName}</p>
                <p className="text-sm text-gray-500">Platform: {integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className={`${
                    integration.status === 'connected' ? 'text-green-600' :
                    integration.status === 'disconnected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                  </span>
                </p>
                {integration.errorMessage && (
                  <p className="text-sm text-red-500">Error: {integration.errorMessage}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {integration.status === 'disconnected' && (
                  <button
                    onClick={() => onReconnect(integration.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Reconnect
                  </button>
                )}
                {integration.status === 'error' && (
                  <button
                    onClick={() => onTroubleshoot(integration.id)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Troubleshoot
                  </button>
                )}
                <button
                  onClick={() => onDisconnect(integration.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
interface ApiManagementProps {
  initialData?: {
    apiKeys: ApiKey[];
    integrations: ThirdPartyIntegration[];
  };
}

const ApiManagement: FC<ApiManagementProps> = ({ initialData = {
  apiKeys: [
    {
      id: '1',
      clientName: 'Client A',
      apiKey: 'api_1234567890abcdef',
      createdAt: '2023-10-01T10:00:00Z',
      status: 'active',
      usageLimit: 1000,
      usageCount: 450,
    },
    {
      id: '2',
      clientName: 'Client B',
      apiKey: 'api_0987654321fedcba',
      createdAt: '2023-10-02T12:00:00Z',
      status: 'revoked',
      usageLimit: 500,
      usageCount: 500,
    },
  ],
  integrations: [
    {
      id: '1',
      platform: 'whatsapp',
      clientName: 'Client A',
      status: 'connected',
      lastChecked: '2023-10-01T10:00:00Z',
    },
    {
      id: '2',
      platform: 'shopify',
      clientName: 'Client B',
      status: 'error',
      lastChecked: '2023-10-02T12:00:00Z',
      errorMessage: 'Authentication failed',
    },
    {
      id: '3',
      platform: 'instagram',
      clientName: 'Client C',
      status: 'disconnected',
      lastChecked: '2023-10-03T14:00:00Z',
    },
  ],
} }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialData.apiKeys);
  const [integrations, setIntegrations] = useState<ThirdPartyIntegration[]>(initialData.integrations);

  const handleIssueKey = (clientName: string) => {
    const newKey: ApiKey = {
      id: Date.now().toString(),
      clientName,
      apiKey: `api_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeKey = (keyId: string) => {
    setApiKeys(apiKeys.map(key =>
      key.id === keyId ? { ...key, status: 'revoked' } : key
    ));
  };

  const handleEditLimit = (keyId: string, newLimit: number) => {
    setApiKeys(apiKeys.map(key =>
      key.id === keyId ? { ...key, usageLimit: newLimit } : key
    ));
  };

  const handleReconnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId ? { ...integration, status: 'connected', errorMessage: undefined } : integration
    ));
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(integrations.map(integration =>
      integration.id === integrationId ? { ...integration, status: 'disconnected' } : integration
    ));
  };

  const handleTroubleshoot = (integrationId: string) => {
    const integration = integrations.find(integration => integration.id === integrationId);
    if (integration) {
      const resolved = confirm(`Troubleshoot issue: ${integration.errorMessage}\nMark as resolved?`);
      if (resolved) {
        setIntegrations(integrations.map(integration =>
          integration.id === integrationId ? { ...integration, status: 'connected', errorMessage: undefined } : integration
        ));
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">API Management</h1>

      <ApiAccessControl
        apiKeys={apiKeys}
        onIssueKey={handleIssueKey}
        onRevokeKey={handleRevokeKey}
        onEditLimit={handleEditLimit}
      />

      <ThirdPartyIntegrations
        integrations={integrations}
        onReconnect={handleReconnect}
        onDisconnect={handleDisconnect}
        onTroubleshoot={handleTroubleshoot}
      />
    </div>
  );
};

export default ApiManagement;