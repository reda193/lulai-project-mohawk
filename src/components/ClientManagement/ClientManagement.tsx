'use client';
import React, { FC, useEffect, useState } from 'react';
import { Users, Edit, MoreHorizontal, Filter, ArrowUpDown, UserPlus, UserMinus, Lock, ArrowUp, ArrowDown, Ban, Activity, X } from 'lucide-react';

// Define proper types for all data structures
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  subscriptionPlan: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  apiUsage: string;
  lastActive: string;
  users: User[];
  activityLogs: ActivityLog[];
}

interface SortConfig {
  key: keyof Client | null;
  direction: 'ascending' | 'descending';
}

interface FilterState {
  industry: string;
  size: string;
  subscriptionPlan: string;
  status: string;
}

const ClientManagement: FC = () => { 
  const [clients, setClients] = useState<Client[]>([]);  

  useEffect(() => {
    const fetchClients = async () => {
      const response = await fetch('/api/admin/clients');
      const { clients } = await response.json();
      setClients(clients);
    };
    
   fetchClients();

 }, [clients]);


  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    industry: '',
    size: '',
    subscriptionPlan: '',
    status: ''
  });

  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Client>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' });

  // Sorting function with type safety
  const sortedClients = [...clients].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Apply filters
  const filteredClients = sortedClients.filter(client => 
    (!filters.industry || client.industry === filters.industry) &&
    (!filters.size || client.size === filters.size) &&
    (!filters.subscriptionPlan || client.subscriptionPlan === filters.subscriptionPlan) &&
    (!filters.status || client.status === filters.status)
  );

  // Handler for sort requests
  const requestSort = (key: keyof Client) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handler for opening edit modal
  const handleEditClient = (client: Client) => {
    setCurrentClient(client);
    setEditFormData({ ...client });
    setShowEditModal(true);
  };

  // Handler for opening activity logs modal
  const handleViewActivity = (client: Client) => {
    setCurrentClient(client);
    setShowActivityModal(true);
  };

  // Handler for opening user management modal
  const handleManageUsers = (client: Client) => {
    setCurrentClient(client);
    setShowUserModal(true);
  };

  // Handler for form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for saving client changes
  const handleSaveChanges = () => {
    if (!currentClient) return;
    
    setClients(prev => 
      prev.map(client => 
        client.id === currentClient.id ? { ...client, ...editFormData as Client } : client
      )
    );
    setShowEditModal(false);
  };

  // Handler for changing client status
  const handleStatusChange = (clientId: string, newStatus: string) => {
    setClients(prev => 
      prev.map(client => 
        client.id === clientId ? { ...client, status: newStatus } : client
      )
    );
  };

  // Handler for changing subscription plan
  const handleChangePlan = (clientId: string, newPlan: string) => {
    setClients(prev => 
      prev.map(client => 
        client.id === clientId ? { ...client, subscriptionPlan: newPlan } : client
      )
    );
    // Could log this activity in a real implementation
  };

  // Handler for changing user role
  const handleChangeUserRole = (clientId: string, userId: string, newRole: 'Admin' | 'User') => {
    setClients(prev => 
      prev.map(client => {
        if (client.id === clientId) {
          const updatedUsers = client.users.map(user => 
            user.id === userId ? { ...user, role: newRole } : user
          );
          return { ...client, users: updatedUsers };
        }
        return client;
      })
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border-b">
        <h1 className="text-xl font-semibold flex items-center mb-4 md:mb-0">
          <Users className="mr-2" /> Client Management Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <select 
            onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
          </select>
          
          <select 
            onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Sizes</option>
            <option value="Small (10-100)">Small (10-100)</option>
            <option value="Medium (100-500)">Medium (100-500)</option>
            <option value="Large (500-1000)">Large (500-1000)</option>
          </select>
          
          <select 
            onChange={(e) => setFilters(prev => ({ ...prev, subscriptionPlan: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Professional">Professional</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          
          <select 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      {/* Client Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('name')}>
                <div className="flex items-center">
                  Client Name 
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('industry')}>
                <div className="flex items-center">
                  Industry
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('size')}>
                <div className="flex items-center">
                  Size
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('subscriptionPlan')}>
                <div className="flex items-center">
                  Subscription
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('status')}>
                <div className="flex items-center">
                  Status
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('apiUsage')}>
                <div className="flex items-center">
                  API Usage
                  <ArrowUpDown className="h-4 w-4 ml-1" />
                </div>
              </th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{client.name}</td>
                <td className="p-3">{client.industry}</td>
                <td className="p-3">{client.size}</td>
                <td className="p-3">{client.subscriptionPlan}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded-full text-xs 
                    ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      client.status === 'Suspended' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}
                  `}>
                    {client.status}
                  </span>
                </td>
                <td className="p-3">{client.apiUsage}</td>
                <td className="p-3 flex items-center space-x-2">
                  {/* Edit Client Button */}
                  <button 
                    className="text-blue-500 hover:text-blue-700 tooltip relative"
                    onClick={() => handleEditClient(client)}
                    title="Edit Client Details"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  
                  {/* Manage Users Button */}
                  <button 
                    className="text-purple-500 hover:text-purple-700 tooltip relative"
                    onClick={() => handleManageUsers(client)}
                    title="Manage User Roles"
                  >
                    <UserPlus className="h-5 w-5" />
                  </button>
                  
                  {/* View Activity Logs Button */}
                  <button 
                    className="text-gray-500 hover:text-gray-700 tooltip relative"
                    onClick={() => handleViewActivity(client)}
                    title="View Activity Logs"
                  >
                    <Activity className="h-5 w-5" />
                  </button>
                  
                  {/* Status Toggle Dropdown */}
                  <div className="relative group">
                    <button className={`
                      text-${client.status === 'Active' ? 'red' : 'green'}-500 
                      hover:text-${client.status === 'Active' ? 'red' : 'green'}-700 
                      tooltip relative
                    `}
                    title={client.status === 'Active' ? 'Suspend Account' : 'Activate Account'}>
                      {client.status === 'Active' ? 
                        <Ban className="h-5 w-5" /> : 
                        <Users className="h-5 w-5" />
                      }
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                      <div className="py-1">
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100"
                          onClick={() => handleStatusChange(client.id, 'Active')}
                        >
                          Activate
                        </button>
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-100"
                          onClick={() => handleStatusChange(client.id, 'Suspended')}
                        >
                          Suspend
                        </button>
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                          onClick={() => handleStatusChange(client.id, 'Inactive')}
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subscription Plan Dropdown */}
                  <div className="relative group">
                    <button className="text-gray-500 hover:text-gray-700 tooltip relative" title="Change Subscription">
                      <ArrowUpDown className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                      <div className="py-1">
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleChangePlan(client.id, 'Basic')}
                        >
                          Downgrade to Basic
                        </button>
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleChangePlan(client.id, 'Professional')}
                        >
                          Change to Professional
                        </button>
                        <button 
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleChangePlan(client.id, 'Enterprise')}
                        >
                          Upgrade to Enterprise
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Edit Client Modal */}
      {showEditModal && currentClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Client Details</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select 
                  name="industry" 
                  value={editFormData.industry || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                <select 
                  name="size" 
                  value={editFormData.size || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Small (10-100)">Small (10-100)</option>
                  <option value="Medium (100-500)">Medium (100-500)</option>
                  <option value="Large (500-1000)">Large (500-1000)</option>
                  <option value="Enterprise (1000+)">Enterprise (1000+)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input 
                  type="text" 
                  name="contactPerson" 
                  value={editFormData.contactPerson || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  name="contactEmail" 
                  value={editFormData.contactEmail || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                <input 
                  type="text" 
                  name="contactPhone" 
                  value={editFormData.contactPhone || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select 
                  name="subscriptionPlan" 
                  value={editFormData.subscriptionPlan || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Basic">Basic</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  name="status" 
                  value={editFormData.status || ''} 
                  onChange={handleFormChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Activity Logs Modal */}
      {showActivityModal && currentClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Activity Logs - {currentClient.name}</h2>
              <button onClick={() => setShowActivityModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left">Timestamp</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClient.activityLogs && currentClient.activityLogs.length > 0 ? (
                    currentClient.activityLogs.map((log) => (
                      <tr key={log.id} className="border-b">
                        <td className="p-3">{log.timestamp}</td>
                        <td className="p-3">
                          <span className={`
                            px-2 py-1 rounded-full text-xs 
                            ${log.type === 'API Call' ? 'bg-blue-100 text-blue-800' : 
                              log.type === 'User Login' ? 'bg-green-100 text-green-800' : 
                              'bg-purple-100 text-purple-800'}
                          `}>
                            {log.type}
                          </span>
                        </td>
                        <td className="p-3">{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-3 text-center text-gray-500">No activity logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing all {currentClient.activityLogs?.length || 0} activity logs
              </div>
              <button 
                onClick={() => setShowActivityModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* User Management Modal */}
      {showUserModal && currentClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Users - {currentClient.name}</h2>
              <button onClick={() => setShowUserModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Feature access is restricted based on subscription level.
                <br />
                Basic: Limited to 3 users, no admin roles, basic features only.
                <br />
                Professional: Up to 10 users, 2 admin roles, advanced features.
                <br />
                Enterprise: Unlimited users, unlimited admin roles, all features.
              </p>
            </div>
            
            <div className="border rounded-lg overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left">User Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentClient.users && currentClient.users.length > 0 ? (
                    currentClient.users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <span className={`
                            px-2 py-1 rounded-full text-xs 
                            ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}
                          `}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {user.role === 'Admin' ? (
                              <button 
                                onClick={() => handleChangeUserRole(currentClient.id, user.id, 'User')}
                                className="text-red-500 hover:text-red-700 tooltip"
                                title="Remove Admin Role"
                              >
                                <UserMinus className="h-5 w-5" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleChangeUserRole(currentClient.id, user.id, 'Admin')}
                                className="text-purple-500 hover:text-purple-700 tooltip"
                                title="Assign Admin Role"
                                disabled={currentClient.subscriptionPlan === 'Basic'}
                              >
                                <UserPlus className="h-5 w-5" />
                              </button>
                            )}
                            <button 
                              className="text-blue-500 hover:text-blue-700 tooltip"
                              title="Edit User"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                disabled={
                  (currentClient.subscriptionPlan === 'Basic' && currentClient.users?.length >= 3) ||
                  (currentClient.subscriptionPlan === 'Professional' && currentClient.users?.length >= 10)
                }
              >
                <UserPlus className="h-4 w-4 mr-1" /> Add New User
              </button>
              <button 
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 border rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;