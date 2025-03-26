'use client';
import { FC, useState, useEffect } from 'react';
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';

// Types
interface SubscribedUser {
  id: number;
  userId: string;
  email: string;
  first_name?: string;
  last_name?: string;
  plan_type: 'FREE' | 'BASIC' | 'PRO';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'TRIALING' | 'UNPAID';
  current_period_start: string;
  current_period_end?: string;
}

interface SubscriptionStats {
  totalActive: number;
  byPlan: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  byStatus: {
    ACTIVE: number;
    PAST_DUE: number;
    CANCELED: number;
    INCOMPLETE: number;
    INCOMPLETE_EXPIRED: number;
    TRIALING: number;
    UNPAID: number;
  };
  estimatedMonthlyRevenue: number;
}

interface ApiResponse {
  subscriptions: {
    id: number;
    userId: number;
    plan_type: 'FREE' | 'BASIC' | 'PRO';
    status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'TRIALING' | 'UNPAID';
    current_period_start: string;
    current_period_end: string | null;
    user: {
      id: number;
      userId: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
    subscription_items: any[];
  }[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: SubscriptionStats;
}

// Subscription Overview Component
interface SubscriptionOverviewProps {
  stats: SubscriptionStats;
}

const SubscriptionOverview: FC<SubscriptionOverviewProps> = ({ stats }) => {
  const activeCount = stats.totalActive;
  const pendingCount = stats.byStatus.PAST_DUE + stats.byStatus.INCOMPLETE + stats.byStatus.UNPAID;
  const trialCount = stats.byStatus.TRIALING;
  const endedCount = stats.byStatus.CANCELED + stats.byStatus.INCOMPLETE_EXPIRED;
  
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subscription Overview</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Total Subscriptions</h3>
          <p className="text-2xl font-bold text-gray-700">{activeCount + pendingCount + trialCount + endedCount}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Pending Subscriptions</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Ended Subscriptions</h3>
          <p className="text-2xl font-bold text-red-600">{endedCount}</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Monthly Revenue</span>
          <span className="font-bold text-green-600">${stats.estimatedMonthlyRevenue.toFixed(2)}</span>
        </div>
        <div className="mt-2 flex gap-4">
          <div>
            <span className="text-sm text-gray-500">Basic Plans</span>
            <p className="font-medium">{stats.byPlan.BASIC}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Pro Plans</span>
            <p className="font-medium">{stats.byPlan.PRO}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500">Free Plans</span>
            <p className="font-medium">{stats.byPlan.FREE}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Format the status for display
const formatStatus = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

// Subscribed Users List Component
interface SubscribedUsersListProps {
  users: SubscribedUser[];
  loading: boolean;
}

const SubscribedUsersList: FC<SubscribedUsersListProps> = ({ users, loading }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subscribed Users</h2>
        <div className="flex gap-2">
          <button className="text-sm text-blue-600">Export</button>
          <button>
            <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading subscription data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No subscribed users found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(user => {
                const userName = user.first_name || user.last_name ? 
                  `${user.first_name || ''} ${user.last_name || ''}`.trim() : 
                  '-';
                  
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-4 whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-sm">{user.userId}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{userName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{user.plan_type}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        user.status === 'TRIALING' ? 'bg-blue-100 text-blue-800' :
                        user.status === 'PAST_DUE' || user.status === 'INCOMPLETE' || user.status === 'UNPAID' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {formatStatus(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{new Date(user.current_period_start).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {user.current_period_end ? new Date(user.current_period_end).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main Subscription Management Component
const SubscriptionManagement: FC = () => {
  const [users, setUsers] = useState<SubscribedUser[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalActive: 0,
    byPlan: { FREE: 0, BASIC: 0, PRO: 0 },
    byStatus: {
      ACTIVE: 0,
      PAST_DUE: 0,
      CANCELED: 0,
      INCOMPLETE: 0,
      INCOMPLETE_EXPIRED: 0,
      TRIALING: 0,
      UNPAID: 0
    },
    estimatedMonthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch subscription data from API
  useEffect(() => {
    fetchSubscriptionData();
  }, [page, limit, search, statusFilter]);
  
  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      // Make API request
      const response = await fetch(`/api/admin/subscription?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Convert API response to our SubscribedUser format
      const transformedUsers: SubscribedUser[] = data.subscriptions.map(sub => ({
        id: sub.id,
        userId: sub.user.userId,
        email: sub.user.email,
        first_name: sub.user.first_name,
        last_name: sub.user.last_name,
        plan_type: sub.plan_type,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end || undefined
      }));
      
      // Update state with fetched data
      setUsers(transformedUsers);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch subscription data:', err);
      setError('Failed to load subscription data. Please try again later.');
      
      // Set default empty state
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Filter users client-side if needed
  const filteredUsers = users;
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {!loading && (
        <SubscriptionOverview stats={stats} />
      )}
      
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <form onSubmit={handleSearch} className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email or user ID"
              className="pl-10 p-2 border border-gray-300 rounded w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          
          <select
            className="p-2 border border-gray-300 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIALING">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELED">Canceled</option>
            <option value="INCOMPLETE">Incomplete</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`p-2 rounded ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Previous
              </button>
              
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`p-2 rounded ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      <SubscribedUsersList users={filteredUsers} loading={loading} />
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 rounded ${pageNum === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;