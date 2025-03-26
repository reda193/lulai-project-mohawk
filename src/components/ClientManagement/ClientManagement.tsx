'use client';
import React, { useState, useEffect } from 'react';
import { Users, Search, Eye, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define proper types for all data structures
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User';
}

interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  subscriptionPlan: string;
  status: string;
  contactEmail: string;
  users: User[];
}

const ClientManagement = () => {
  const router = useRouter();
  
  // Search functionality
  const [searchType, setSearchType] = useState<'id' | 'email'>('email');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  
  // Client data state
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch clients on component mount
  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch('/api/admin/clients');
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data.clients);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchClients();
  }, []);

  // Handle client search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Call the real API endpoint
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchType, searchQuery }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setSearchResults(data.clients);
      setShowSearchModal(true);
    } catch (error) {
      console.error('Error searching clients:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Navigate to client analytics
  const viewClientAnalytics = (botId: string) => {
    router.push(`/agents/${botId}`);
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="text-center text-red-500 p-4 border border-red-200 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-xl font-semibold flex items-center mb-4 md:mb-0">
          <Users className="mr-2" /> Client Management
        </h1>
        
        {/* Search Bar for User ID or Email */}
        <div className="w-full md:w-1/2">
          <div className="flex items-center">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'id' | 'email')}
              className="border rounded-l-md px-2 py-2 text-sm"
            >
              <option value="id">User ID</option>
              <option value="email">Email</option>
            </select>
            <input 
              type="text" 
              placeholder={searchType === 'id' ? "Search by User ID..." : "Search by Email..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow border-y px-3 py-2 text-sm focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className={`bg-blue-600 text-white px-4 py-2 rounded-r-md text-sm flex items-center
                ${(isSearching || !searchQuery.trim()) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Search for clients by user ID or email address to view their analytics</p>
        </div>
      </div>
      
      {/* Recent Clients Section */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Recent Clients</h2>
        <div className="border rounded-lg overflow-hidden">
          {clients.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Bot Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Plan</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{client.name}</td>
                    <td className="p-3">{client.contactEmail}</td>
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
                    <td className="p-3">
                      <button 
                        onClick={() => viewClientAnalytics(client.id)}
                        className="flex items-center text-green-600 hover:text-green-800"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Analytics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-700">No clients found</h3>
              <p className="text-gray-500">No clients have been added yet</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Search Results Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Search Results</h2>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4 bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Searching for:</strong> {searchType === 'id' ? 'User ID' : 'Email'} containing "{searchQuery}"
              </p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="border rounded-lg overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="p-3 text-left">Bot Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((client) => (
                      <tr key={client.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{client.name}</td>
                        <td className="p-3">{client.contactEmail}</td>
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
                        <td className="p-3">
                          <button 
                            onClick={() => {
                              viewClientAnalytics(client.id);
                              setShowSearchModal(false);
                            }}
                            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm flex items-center hover:bg-green-700"
                          >
                            <Eye className="h-4 w-4 mr-1" /> View Analytics
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-700">No clients found</h3>
                <p className="text-gray-500">Try a different search term or criteria</p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowSearchModal(false)}
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