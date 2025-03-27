'use client';
import { FC, useEffect, useState } from 'react';
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
const SecurityManagement: FC = () => { 
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [requests, setRequests] = useState<ComplianceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch logs
        const logsResponse = await fetch('/api/admin/logs');
        const logsData = await logsResponse.json();
        
        // Fetch requests
        const requestsResponse = await fetch('/api/admin/requests');
        const requestsData = await requestsResponse.json();
        
        // Update state with fetched data
        setLogs(logsData.logs || []);
        setRequests(requestsData.requests || []);
      } catch (error) {
        console.error('Error fetching security data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array ensures this only runs once

  const handleEnforce2FA = async (userId: string) => {
    try {
      // API call to enforce 2FA
      await fetch(`/api/admin/users/${userId}/enforce2fa`, {
        method: 'POST',
      });
      
      alert(`2FA enforced for user ${userId}`);
    } catch (error) {
      console.error('Error enforcing 2FA:', error);
    }
  };

  const handleMarkAsResolved = async (logId: string) => {
    try {
      // Optimistic UI update
      setLogs(prevLogs =>
        prevLogs.map(log =>
          log.id === logId ? { ...log, isSuspicious: false } : log
        )
      );
      
      // API call to mark as resolved
      await fetch(`/api/admin/logs/${logId}/resolve`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking log as resolved:', error);
      // Revert optimistic update on error
      // You might want to re-fetch data here
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const currentTime = new Date().toISOString();
      
      // Optimistic UI update
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId 
            ? { ...request, status: 'completed', completedAt: currentTime } 
            : request
        )
      );
      
      // API call to complete request
      await fetch(`/api/admin/requests/${requestId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedAt: currentTime })
      });
    } catch (error) {
      console.error('Error completing request:', error);
      // Handle error appropriately
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Optimistic UI update
      setRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? { ...request, status: 'rejected' } : request
        )
      );
      
      // API call to reject request
      await fetch(`/api/admin/requests/${requestId}/reject`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Handle error appropriately
    }
  };

  if (loading) {
    return <div className="p-6">Loading security management data...</div>;
  }

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