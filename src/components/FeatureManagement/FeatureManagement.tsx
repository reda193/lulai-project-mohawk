'use client';
import { FC, useState } from 'react';
import { MoreHorizontalIcon, ToggleLeftIcon, ToggleRightIcon, SettingsIcon, BoxIcon, PlayIcon } from 'lucide-react';

// Types
interface FeatureFlag {
  id: string;
  featureName: string;
  description: string;
  enabledFor: string[]; // List of client IDs or "all"
  isActive: boolean;
}

interface CustomFeature {
  id: string;
  clientId: string;
  featureName: string;
  description: string;
  status: 'draft' | 'testing' | 'live';
  sandboxUrl?: string;
  productionUrl?: string;
}

// Feature Flags Component
interface FeatureFlagsProps {
  flags: FeatureFlag[];
  onToggle: (flagId: string, isActive: boolean) => void;
  onEdit: (flagId: string) => void;
}

const FeatureFlags: FC<FeatureFlagsProps> = ({ flags, onToggle, onEdit }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Feature Flags</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {flags.map(flag => (
          <div key={flag.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{flag.featureName}</p>
                <p className="text-sm text-gray-500">{flag.description}</p>
                <p className="text-sm text-gray-500">
                  Enabled for: {flag.enabledFor.includes('all') ? 'All Clients' : `${flag.enabledFor.length} Clients`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(flag.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onToggle(flag.id, !flag.isActive)}
                  className={`p-2 rounded-full ${
                    flag.isActive ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  {flag.isActive ? (
                    <ToggleRightIcon className="w-5 h-5 text-white" />
                  ) : (
                    <ToggleLeftIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Feature Deployment Component
interface CustomFeatureDeploymentProps {
  features: CustomFeature[];
  onDeployToSandbox: (featureId: string) => void;
  onDeployToProduction: (featureId: string) => void;
  onEdit: (featureId: string) => void;
}

const CustomFeatureDeployment: FC<CustomFeatureDeploymentProps> = ({
  features,
  onDeployToSandbox,
  onDeployToProduction,
  onEdit,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Custom Feature Deployment</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {features.map(feature => (
          <div key={feature.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{feature.featureName}</p>
                <p className="text-sm text-gray-500">{feature.description}</p>
                <p className="text-sm text-gray-500">
                  Status: <span className={`${
                    feature.status === 'draft' ? 'text-gray-600' :
                    feature.status === 'testing' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {feature.status.charAt(0).toUpperCase() + feature.status.slice(1)}
                  </span>
                </p>
                {feature.sandboxUrl && (
                  <p className="text-sm text-gray-500">
                    Sandbox URL: <a href={feature.sandboxUrl} className="text-blue-600 hover:underline">{feature.sandboxUrl}</a>
                  </p>
                )}
                {feature.productionUrl && (
                  <p className="text-sm text-gray-500">
                    Production URL: <a href={feature.productionUrl} className="text-blue-600 hover:underline">{feature.productionUrl}</a>
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(feature.id)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <SettingsIcon className="w-5 h-5" />
                </button>
                {feature.status === 'draft' && (
                  <button
                    onClick={() => onDeployToSandbox(feature.id)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Deploy to Sandbox
                  </button>
                )}
                {feature.status === 'testing' && (
                  <button
                    onClick={() => onDeployToProduction(feature.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Deploy to Production
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component
interface FeatureManagementProps {
  initialData?: {
    flags: FeatureFlag[];
    features: CustomFeature[];
  };
}

const FeatureManagement: FC<FeatureManagementProps> = ({ initialData = { flags: [
  {
    id: '1',
    featureName: 'Sample Feature Flag',
    description: 'This is a sample feature flag.',
    enabledFor: ['all'],
    isActive: true,
  },
],
features: [
  {
    id: '1',
    clientId: 'client1',
    featureName: 'Sample Custom Feature',
    description: 'This is a sample custom feature.',
    status: 'draft',
  },
] } }) => {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialData.flags);
  const [features, setFeatures] = useState<CustomFeature[]>(initialData.features);

  const handleToggleFlag = (flagId: string, isActive: boolean) => {
    setFlags(flags.map(flag =>
      flag.id === flagId ? { ...flag, isActive } : flag
    ));
  };

  const handleEditFlag = (flagId: string) => {
    const flag = flags.find(flag => flag.id === flagId);
    if (flag) {
      const newEnabledFor = prompt('Update enabled clients (comma-separated IDs or "all"):', flag.enabledFor.join(','));
      if (newEnabledFor !== null) {
        const updatedEnabledFor = newEnabledFor.trim() === 'all' ? ['all'] : newEnabledFor.split(',').map(s => s.trim());
        setFlags(flags.map(flag =>
          flag.id === flagId ? { ...flag, enabledFor: updatedEnabledFor } : flag
        ));
      }
    }
  };

  const handleDeployToSandbox = (featureId: string) => {
    setFeatures(features.map(feature =>
      feature.id === featureId ? { ...feature, status: 'testing', sandboxUrl: `https://sandbox.example.com/${featureId}` } : feature
    ));
  };

  const handleDeployToProduction = (featureId: string) => {
    setFeatures(features.map(feature =>
      feature.id === featureId ? { ...feature, status: 'live', productionUrl: `https://production.example.com/${featureId}` } : feature
    ));
  };

  const handleEditFeature = (featureId: string) => {
    const feature = features.find(feature => feature.id === featureId);
    if (feature) {
      const newFeatureName = prompt('Update feature name:', feature.featureName);
      const newDescription = prompt('Update description:', feature.description);
      if (newFeatureName !== null && newDescription !== null) {
        setFeatures(features.map(feature =>
          feature.id === featureId ? { ...feature, featureName: newFeatureName, description: newDescription } : feature
        ));
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feature Management</h1>

      <FeatureFlags
        flags={flags}
        onToggle={handleToggleFlag}
        onEdit={handleEditFlag}
      />

      <CustomFeatureDeployment
        features={features}
        onDeployToSandbox={handleDeployToSandbox}
        onDeployToProduction={handleDeployToProduction}
        onEdit={handleEditFeature}
      />
    </div>
  );
};

export default FeatureManagement;