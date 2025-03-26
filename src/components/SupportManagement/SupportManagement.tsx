'use client';
import { FC, useState, useEffect } from 'react';
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';

// Types based on API response
interface TicketResponse {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'ISSUE' | 'FEATURE_REQUEST' | 'BILLING' | 'QUESTION' | 'INTEGRATION' | 'OTHER';
  client: {
    id: number;
    userId: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  solved_by: {
    id: number;
    userId: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  bot: {
    id: string;
    bot_name: string;
    model_type: string;
  } | null;
  created_at: string;
  updated_at: string;
  response_time: number | null;
  resolved_at: string | null;
  _count?: {
    ticket_comments: number;
    ticket_attachments: number;
  };
}

interface DashboardData {
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResponseTime: string;
}

interface ApiResponse {
  dashboard: DashboardData;
  tickets: TicketResponse[];
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// For UI display
interface SupportTicket {
  id: string;
  clientName: string;
  issue: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  responseTime?: number; // in hours
}

// Support Ticket Dashboard Component
interface SupportTicketDashboardProps {
  dashboard: DashboardData;
  tickets: SupportTicket[];
  loading: boolean;
  onAssign: (ticketId: string) => void;
  onResolve: (ticketId: string) => void;
}

const SupportTicketDashboard: FC<SupportTicketDashboardProps> = ({ dashboard, tickets, loading, onAssign, onResolve }) => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Support Ticket Dashboard</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading ticket data...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500">Open Tickets</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboard.openTickets}</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500">In Progress</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboard.inProgressTickets}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500">Resolved Tickets</h3>
              <p className="text-2xl font-bold text-green-600">{dashboard.resolvedTickets}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-500">Avg. Response Time</h3>
              <p className="text-2xl font-bold text-purple-600">{dashboard.avgResponseTime}h</p>
            </div>
          </div>

          <div className="mt-6">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-4 whitespace-nowrap">{ticket.clientName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{ticket.issue}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs ${
                        ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase().replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {ticket.assignedTo || (
                        <button
                          onClick={() => onAssign(ticket.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                        <button
                          onClick={() => onResolve(ticket.id)}
                          className="text-green-600 hover:text-green-800"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
interface SupportManagementProps {
  initialData?: {
    tickets: SupportTicket[];
  };
}

const SupportManagement: FC<SupportManagementProps> = ({ initialData }) => {
  // API data states
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData>({
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '0.0'
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch ticket data from API
  useEffect(() => {
    fetchTicketData();
  }, [search, statusFilter]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      
      // Make API request
      const response = await fetch(`/api/admin/support?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Set dashboard data
      setDashboard(data.dashboard);
      
      // Transform ticket data to match our UI format
      const transformedTickets: SupportTicket[] = data.tickets.map(ticket => ({
        id: ticket.id,
        clientName: `${ticket.client.first_name || ''} ${ticket.client.last_name || ''}`.trim() || ticket.client.email,
        issue: ticket.title,
        status: ticket.status,
        assignedTo: ticket.solved_by ? 
          `${ticket.solved_by.first_name || ''} ${ticket.solved_by.last_name || ''}`.trim() || 
          ticket.solved_by.email : 
          undefined,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        responseTime: ticket.response_time ? ticket.response_time / 3600 : undefined // Convert seconds to hours
      }));
      
      setTickets(transformedTickets);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch ticket data:', err);
      setError('Failed to load ticket data. Please try again later.');
      
      // Set empty state
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async (ticketId: string) => {
    try {
      const staffId = prompt('Enter staff ID:');
      if (!staffId) return;
      
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          solved_by_id: parseInt(staffId),
          status: 'IN_PROGRESS'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error assigning ticket: ${response.status}`);
      }
      
      // Refresh ticket data
      fetchTicketData();
    } catch (err) {
      console.error('Failed to assign ticket:', err);
      alert('Failed to assign ticket. Please try again.');
    }
  };

  // Handle ticket resolution
  const handleResolveTicket = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/support/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error resolving ticket: ${response.status}`);
      }
      
      // Refresh ticket data
      fetchTicketData();
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
      alert('Failed to resolve ticket. Please try again.');
    }
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTicketData();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Management</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <form onSubmit={handleSearch} className="w-full md:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tickets..."
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
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      <SupportTicketDashboard
        dashboard={dashboard}
        tickets={tickets}
        loading={loading}
        onAssign={handleAssignTicket}
        onResolve={handleResolveTicket}
      />
    </div>
  );
};

export default SupportManagement;