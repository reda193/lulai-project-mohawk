'use client';
import { FC, useState } from 'react';
import { 
  MoreHorizontalIcon, 
  AlertTriangleIcon, 
  BarChart4, 
  Database, 
  RefreshCw, 
  Terminal, 
  Bot, 
  Server, 
  CheckCircle, 
  XCircle, 
  AlertOctagon,
  ArrowDownCircle,
  ArrowUpCircle
} from 'lucide-react';

// Types
interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  type: string;
  status: 'active' | 'inactive' | 'deprecated';
  lastUpdated: string;
}

interface ClientModel {
  clientId: string;
  clientName: string;
  defaultModel: string;
  enabledModels: string[];
  usageThisMonth: number;
  lastInteraction: string;
}

interface TrainingDataset {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  status: 'pending_review' | 'approved' | 'rejected';
  fileCount: number;
  totalSize: string;
  submittedAt: string;
  description: string;
}

interface UsageStatistic {
  date: string;
  totalInteractions: number;
  uniqueUsers: number;
  avgResponseTime: number;
  errorRate: number;
}

interface ErrorLog {
  id: string;
  clientId: string;
  clientName: string;
  timestamp: string;
  errorType: string;
  errorMessage: string;
  modelId: string;
  modelName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved';
}

// AI Models Overview Component
interface AIModelListProps {
  models: AIModel[];
  onPushUpdate: (modelId: string) => void;
}

const AIModelList: FC<AIModelListProps> = ({ models, onPushUpdate }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">Integrated AI Models</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {models.map(model => (
              <tr key={model.id}>
                <td className="px-4 py-4 whitespace-nowrap font-medium">{model.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{model.provider}</td>
                <td className="px-4 py-4 whitespace-nowrap">{model.version}</td>
                <td className="px-4 py-4 whitespace-nowrap">{model.type}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    model.status === 'active' ? 'bg-green-100 text-green-800' :
                    model.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{model.lastUpdated}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onPushUpdate(model.id)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Push Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Client Model Configuration Component
interface ClientModelConfigProps {
  clients: ClientModel[];
  models: AIModel[];
  onChangeDefault: (clientId: string, modelId: string) => void;
}

const ClientModelConfig: FC<ClientModelConfigProps> = ({ clients, models, onChangeDefault }) => {
  const activeModels = models.filter(model => model.status === 'active');
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Client Model Configuration</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Model</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage This Month</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Interaction</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map(client => (
              <tr key={client.clientId}>
                <td className="px-4 py-4 whitespace-nowrap font-medium">{client.clientName}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <select 
                    value={client.defaultModel}
                    onChange={(e) => onChangeDefault(client.clientId, e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {activeModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{client.usageThisMonth.toLocaleString()} interactions</td>
                <td className="px-4 py-4 whitespace-nowrap">{client.lastInteraction}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button 
                    className="text-purple-600 hover:text-purple-800"
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Training Dataset Review Component
interface TrainingDatasetReviewProps {
  datasets: TrainingDataset[];
  onApprove: (datasetId: string) => void;
  onReject: (datasetId: string) => void;
}

const TrainingDatasetReview: FC<TrainingDatasetReviewProps> = ({ datasets, onApprove, onReject }) => {
  const pendingDatasets = datasets.filter(dataset => dataset.status === 'pending_review');
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-semibold">Training Dataset Oversight</h2>
        </div>
        <div className="flex gap-2">
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
            {pendingDatasets.length} Pending Review
          </span>
          <button>
            <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      {pendingDatasets.length > 0 ? (
        <div className="space-y-4">
          {pendingDatasets.map(dataset => (
            <div key={dataset.id} className="border border-yellow-100 rounded-lg p-4 bg-yellow-50">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-lg">{dataset.name}</h3>
                  <p className="text-sm text-gray-500">Client: {dataset.clientName}</p>
                  <p className="text-sm text-gray-500">Files: {dataset.fileCount} ({dataset.totalSize})</p>
                  <p className="text-sm text-gray-500">Submitted: {dataset.submittedAt}</p>
                  <p className="mt-2">{dataset.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => onApprove(dataset.id)}
                    className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => onReject(dataset.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-6 text-gray-500">No datasets pending review</p>
      )}
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Recent Activity</h3>
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dataset</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {datasets.filter(d => d.status !== 'pending_review').map(dataset => (
                <tr key={dataset.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{dataset.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{dataset.clientName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      dataset.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {dataset.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{dataset.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// System Analytics Component
interface SystemAnalyticsProps {
  statistics: UsageStatistic[];
}

const SystemAnalytics: FC<SystemAnalyticsProps> = ({ statistics }) => {
  // Calculate summary metrics
  const totalInteractions = statistics.reduce((sum, stat) => sum + stat.totalInteractions, 0);
  const avgResponseTime = statistics.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / statistics.length;
  const avgErrorRate = statistics.reduce((sum, stat) => sum + stat.errorRate, 0) / statistics.length;
  
  // Find peak usage day
  const peakUsageDay = statistics.length > 0 
  ? statistics.reduce((max, stat) => 
      stat.totalInteractions > max.totalInteractions ? stat : max, statistics[0])
  : null;

  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BarChart4 className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold">System-Wide Analytics</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Total Interactions</h3>
          <p className="text-2xl font-bold text-blue-600">{totalInteractions.toLocaleString()}</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
  <h3 className="text-sm text-gray-500">Peak Usage Day</h3>
  {peakUsageDay ? (
    <>
      <p className="text-2xl font-bold text-green-600">{peakUsageDay.date}</p>
      <p className="text-sm text-gray-500">{peakUsageDay.totalInteractions.toLocaleString()} interactions</p>
    </>
  ) : (
    <p className="text-sm text-gray-500">No data available</p>
  )}
</div>

        
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Avg Response Time</h3>
          <p className="text-2xl font-bold text-purple-600">{avgResponseTime.toFixed(2)}s</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Avg Error Rate</h3>
          <p className="text-2xl font-bold text-red-600">{avgErrorRate.toFixed(2)}%</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">Usage Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
          {/* This would be replaced with a proper chart component */}
          {statistics.map((stat, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-500 w-10" 
                style={{ height: `${peakUsageDay ? (stat.totalInteractions / peakUsageDay.totalInteractions) * 100 : 0}%` }}
              ></div>
              <span className="text-xs mt-1">{stat.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-2">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interactions</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Users</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Response Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statistics.map((stat, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap">{stat.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{stat.totalInteractions.toLocaleString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{stat.uniqueUsers.toLocaleString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{stat.avgResponseTime.toFixed(2)}s</td>
                  <td className="px-4 py-2 whitespace-nowrap">{stat.errorRate.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Error Report Component
interface ErrorReportProps {
  errors: ErrorLog[];
  onRollback: (errorId: string) => void;
}

const ErrorReport: FC<ErrorReportProps> = ({ errors, onRollback }) => {
  const criticalErrors = errors.filter(error => error.severity === 'critical' && error.status !== 'resolved');
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold">Incident & Error Reports</h2>
        </div>
        <div className="flex gap-2">
          {criticalErrors.length > 0 && (
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <AlertTriangleIcon className="w-3 h-3" />
              {criticalErrors.length} Critical Issues
            </span>
          )}
          <button>
            <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      {criticalErrors.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="font-medium">Critical Alerts</h3>
          {criticalErrors.map(error => (
            <div key={error.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-1">
                    <AlertTriangleIcon className="w-4 h-4 text-red-500" />
                    {error.errorType}
                  </h4>
                  <p className="text-sm text-gray-700 mt-1">{error.errorMessage}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Client: {error.clientName}</span>
                    <span>Model: {error.modelName}</span>
                    <span>Time: {error.timestamp}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => onRollback(error.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    Quick Rollback
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Recent Errors</h3>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Critical</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Low</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {errors.map(error => (
                <tr key={error.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{error.errorType}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{error.clientName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{error.modelName}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{error.timestamp}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className={`w-2 h-2 rounded-full ${
                      error.severity === 'critical' ? 'bg-red-500' :
                      error.severity === 'high' ? 'bg-orange-500' :
                      error.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    } inline-block mr-2`}></div>
                    {error.severity.charAt(0).toUpperCase() + error.severity.slice(1)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs ${
                      error.status === 'new' ? 'bg-red-100 text-red-800' :
                      error.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {error.status.charAt(0).toUpperCase() + error.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-800">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Main AI Management Component
interface AIManagementProps {
  initialData?: {
    models: AIModel[];
    clients: ClientModel[];
    datasets: TrainingDataset[];
    statistics: UsageStatistic[];
    errors: ErrorLog[];
  };
}

const AIManagement: FC<AIManagementProps> = ({ initialData = { 
  models: [
    {
      id: '1',
      name: 'GPT-4',
      provider: 'OpenAI',
      version: '4.0',
      type: 'Text Generation',
      status: 'active',
      lastUpdated: '2023-10-01',
    },
    {
      id: '2',
      name: 'BERT',
      provider: 'Google',
      version: '1.0',
      type: 'Text Classification',
      status: 'inactive',
      lastUpdated: '2023-09-15',
    },
    {
      id: '3',
      name: 'DALL-E',
      provider: 'OpenAI',
      version: '2.0',
      type: 'Image Generation',
      status: 'deprecated',
      lastUpdated: '2023-08-01',
    },
  ],
  clients: [
    {
      clientId: '1',
      clientName: 'Client A',
      defaultModel: '1',
      enabledModels: ['1', '2'],
      usageThisMonth: 1200,
      lastInteraction: '2023-10-05T14:30:00Z',
    },
    {
      clientId: '2',
      clientName: 'Client B',
      defaultModel: '2',
      enabledModels: ['2'],
      usageThisMonth: 800,
      lastInteraction: '2023-10-04T10:15:00Z',
    },
  ],
  datasets: [
    {
      id: '1',
      clientId: '1',
      clientName: 'Client A',
      name: 'Customer Support Dataset',
      status: 'pending_review',
      fileCount: 10,
      totalSize: '1.2 GB',
      submittedAt: '2023-10-01T09:00:00Z',
      description: 'Dataset containing customer support interactions for training.',
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Client B',
      name: 'Product Reviews Dataset',
      status: 'approved',
      fileCount: 5,
      totalSize: '500 MB',
      submittedAt: '2023-09-28T11:00:00Z',
      description: 'Dataset containing product reviews for sentiment analysis.',
    },
  ],
  statistics: [
    {
      date: '2023-10-01',
      totalInteractions: 1200,
      uniqueUsers: 300,
      avgResponseTime: 1.2,
      errorRate: 0.5,
    },
    {
      date: '2023-10-02',
      totalInteractions: 1500,
      uniqueUsers: 400,
      avgResponseTime: 1.1,
      errorRate: 0.4,
    },
    {
      date: '2023-10-03',
      totalInteractions: 1800,
      uniqueUsers: 500,
      avgResponseTime: 1.3,
      errorRate: 0.6,
    },
  ],
  errors: [
    {
      id: '1',
      clientId: '1',
      clientName: 'Client A',
      timestamp: '2023-10-01T12:00:00Z',
      errorType: 'Timeout',
      errorMessage: 'Request timed out after 10 seconds.',
      modelId: '1',
      modelName: 'GPT-4',
      severity: 'high',
      status: 'new',
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Client B',
      timestamp: '2023-10-02T14:00:00Z',
      errorType: 'Authentication Failure',
      errorMessage: 'Invalid API key provided.',
      modelId: '2',
      modelName: 'BERT',
      severity: 'critical',
      status: 'investigating',
    },
  ],
} }) => {
  const [models, setModels] = useState<AIModel[]>(initialData.models);
  const [clients, setClients] = useState<ClientModel[]>(initialData.clients);
  const [datasets, setDatasets] = useState<TrainingDataset[]>(initialData.datasets);
  const [statistics, setStatistics] = useState<UsageStatistic[]>(initialData.statistics);
  const [errors, setErrors] = useState<ErrorLog[]>(initialData.errors);
  
  const handlePushUpdate = (modelId: string) => {
    // In a real implementation, this would make an API call to push model updates
    console.log(`Pushing updates for model ${modelId} to all instances`);
    
    // Update the lastUpdated date for the model
    setModels(models.map(model => 
      model.id === modelId ? { ...model, lastUpdated: new Date().toISOString().split('T')[0] } : model
    ));
  };
  
  const handleChangeDefaultModel = (clientId: string, modelId: string) => {
    // In a real implementation, this would make an API call
    setClients(clients.map(client => 
      client.clientId === clientId ? { ...client, defaultModel: modelId } : client
    ));
  };
  
  const handleApproveDataset = (datasetId: string) => {
    // In a real implementation, this would make an API call
    setDatasets(datasets.map(dataset => 
      dataset.id === datasetId ? { ...dataset, status: 'approved' } : dataset
    ));
  };
  
  const handleRejectDataset = (datasetId: string) => {
    // In a real implementation, this would make an API call
    setDatasets(datasets.map(dataset => 
      dataset.id === datasetId ? { ...dataset, status: 'rejected' } : dataset
    ));
  };
  
  const handleRollback = (errorId: string) => {
    // In a real implementation, this would make an API call to rollback
    console.log(`Rolling back system for error ${errorId}`);
    
    // Mark the error as investigating
    setErrors(errors.map(error => 
      error.id === errorId ? { ...error, status: 'investigating' } : error
    ));
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">AI Model Management & Monitoring</h1>
      
      <AIModelList 
        models={models}
        onPushUpdate={handlePushUpdate}
      />
      
      <ClientModelConfig 
        clients={clients}
        models={models}
        onChangeDefault={handleChangeDefaultModel}
      />
      
      <TrainingDatasetReview 
        datasets={datasets}
        onApprove={handleApproveDataset}
        onReject={handleRejectDataset}
      />
      
      <SystemAnalytics 
        statistics={statistics}
      />
      
      <ErrorReport 
        errors={errors}
        onRollback={handleRollback}
      />
    </div>
  );
};

export default AIManagement;