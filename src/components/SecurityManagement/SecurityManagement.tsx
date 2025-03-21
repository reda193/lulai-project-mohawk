'use client';
import { FC, useState } from 'react';
import { MoreHorizontalIcon, LockIcon, ShieldIcon, AlertCircleIcon, TrashIcon, CheckIcon } from 'lucide-react';

// Types
interface AccessLog {
  id: string;
  userId: string;
  username: string;
  ipAddress: string;
  timestamp: string;
  activity: 'login' | 'logout' | 'failed_login';
  location?: string;
  isSuspicious: boolean;
}

interface ComplianceRequest {
  id: string;
  userId: string;
  username: string;
  requestType: 'data_deletion' | 'data_access';
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
}

// User Access Logs Component
interface UserAccessLogsProps {
  logs: AccessLog[];
  onEnforce2FA: (userId: string) => void;
  onMarkAsResolved: (logId: string) => void;
}

const UserAccessLogs: FC<UserAccessLogsProps> = ({ logs, onEnforce2FA, onMarkAsResolved }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Access Logs</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {logs.map(log => (
          <div key={log.id} className={`border ${
            log.isSuspicious ? 'border-red-200 bg-red-50' : 'border-gray-200'
          } rounded-lg p-4`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{log.username}</p>
                <p className="text-sm text-gray-500">IP: {log.ipAddress}</p>
                <p className="text-sm text-gray-500">Activity: {log.activity.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">Timestamp: {log.timestamp}</p>
                {log.location && (
                  <p className="text-sm text-gray-500">Location: {log.location}</p>
                )}
                {log.isSuspicious && (
                  <p className="text-sm text-red-500">Suspicious Activity Detected</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {log.isSuspicious && (
                  <button
                    onClick={() => onEnforce2FA(log.userId)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Enforce 2FA
                  </button>
                )}
                <button
                  onClick={() => onMarkAsResolved(log.id)}
                  className="text-green-600 hover:text-green-800"
                >
                  <CheckIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Compliance Dashboard Component
interface ComplianceDashboardProps {
  requests: ComplianceRequest[];
  onCompleteRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

const ComplianceDashboard: FC<ComplianceDashboardProps> = ({ requests, onCompleteRequest, onRejectRequest }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Compliance Dashboard</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="space-y-4">
        {requests.map(request => (
          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{request.username}</p>
                <p className="text-sm text-gray-500">Request Type: {request.requestType.replace('_', ' ')}</p>
                <p className="text-sm text-gray-500">Status: <span className={`${
                  request.status === 'pending' ? 'text-yellow-600' :
                  request.status === 'completed' ? 'text-green-600' :
                  'text-red-600'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span></p>
                <p className="text-sm text-gray-500">Requested At: {request.requestedAt}</p>
                {request.completedAt && (
                  <p className="text-sm text-gray-500">Completed At: {request.completedAt}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onCompleteRequest(request.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => onRejectRequest(request.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
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
interface SecurityManagementProps {
  initialData?: {
    logs: AccessLog[];
    requests: ComplianceRequest[];
  };
}

const SecurityManagement: FC<SecurityManagementProps> = ({ initialData = {
  logs: [
    {
      id: '1',
      userId: 'user1',
      username: 'john_doe',
      ipAddress: '192.168.1.1',
      timestamp: '2023-10-01T12:34:56Z',
      activity: 'login',
      location: 'New York, USA',
      isSuspicious: false,
    },
    {
      id: '2',
      userId: 'user2',
      username: 'jane_smith',
      ipAddress: '203.0.113.45',
      timestamp: '2023-10-02T14:22:10Z',
      activity: 'failed_login',
      location: 'London, UK',
      isSuspicious: true,
    },
    {
      id: '3',
      userId: 'user3',
      username: 'alice_wonder',
      ipAddress: '198.51.100.23',
      timestamp: '2023-10-03T09:15:30Z',
      activity: 'logout',
      isSuspicious: false,
    },
  ],
  requests: [
    {
      id: '1',
      userId: 'user1',
      username: 'john_doe',
      requestType: 'data_access',
      status: 'pending',
      requestedAt: '2023-10-01T10:00:00Z',
    },
    {
      id: '2',
      userId: 'user2',
      username: 'jane_smith',
      requestType: 'data_deletion',
      status: 'completed',
      requestedAt: '2023-10-02T11:30:00Z',
      completedAt: '2023-10-02T12:00:00Z',
    },
    {
      id: '3',
      userId: 'user3',
      username: 'alice_wonder',
      requestType: 'data_access',
      status: 'rejected',
      requestedAt: '2023-10-03T09:00:00Z',
    },
  ],
} }) => {
  const [logs, setLogs] = useState<AccessLog[]>(initialData.logs);
  const [requests, setRequests] = useState<ComplianceRequest[]>(initialData.requests);

  const handleEnforce2FA = (userId: string) => {
    // In a real implementation, this would make an API call to enforce 2FA
    alert(`2FA enforced for user ${userId}`);
  };

  const handleMarkAsResolved = (logId: string) => {
    setLogs(logs.map(log =>
      log.id === logId ? { ...log, isSuspicious: false } : log
    ));
  };

  const handleCompleteRequest = (requestId: string) => {
    setRequests(requests.map(request =>
      request.id === requestId ? { ...request, status: 'completed', completedAt: new Date().toISOString() } : request
    ));
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.map(request =>
      request.id === requestId ? { ...request, status: 'rejected' } : request
    ));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Security Management</h1>

      <UserAccessLogs
        logs={logs}
        onEnforce2FA={handleEnforce2FA}
        onMarkAsResolved={handleMarkAsResolved}
      />

      <ComplianceDashboard
        requests={requests}
        onCompleteRequest={handleCompleteRequest}
        onRejectRequest={handleRejectRequest}
      />
    </div>
  );
};

export default SecurityManagement;