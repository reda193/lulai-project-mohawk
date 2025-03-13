'use client';

import { useState, useEffect, useRef } from 'react';
import { MenuIcon, Copy, AlertCircle, ExternalLink, CheckCircle, Code, MessageSquare, Globe } from 'lucide-react';
import Sidebar from '@/components/Sidebar/Sidebar';
import AgentNavigation from '@/components/Navigation/AgentNavigation';
import { usePathname } from 'next/navigation';

const AgentIntegrationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [agent, setAgent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [allowedHosts, setAllowedHosts] = useState<string[]>([]);
  const [newHost, setNewHost] = useState<string>('');
  const [showAddHost, setShowAddHost] = useState<boolean>(false);
  const [hostError, setHostError] = useState<string | null>(null);
  
  // Get agent ID from path
  const pathname = usePathname();
  const pathSegments = pathname?.split('/') || [];
  const agentId = pathSegments.length > 2 ? pathSegments[2] : null;

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agentId) {
        setError('No agent ID found in URL');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/bot/${agentId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent details. Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const botData = data.bot;
        
        if (!botData) {
          throw new Error('Bot data not found in response');
        }
        
        setAgent({
          id: botData.id,
          name: botData.bot_name || 'Unnamed Agent',
          description: botData.description || null,
          appearance: Array.isArray(botData.appearance) && botData.appearance.length > 0
            ? botData.appearance[0]
            : botData.appearance || null
        });
        
        // Mock allowed hosts data - in production this would come from your API
        setAllowedHosts(['example.com', 'yourdomain.com']);
      } catch (error: unknown) {
        console.error('Error fetching agent details:', error);
        
        let errorMessage = 'Failed to load agent details';
        
        if (error instanceof Error) {
          errorMessage += `: ${error.message}`;
        } else if (typeof error === 'string') {
          errorMessage += `: ${error}`;
        } else if (error && typeof error === 'object' && 'message' in error) {
          errorMessage += `: ${error.message}`;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId]);

  // Generate embeddable JavaScript code
  const generateJavaScriptCode = () => {
    if (!agent) return '';
    
    return `<script>
  (function (w, d, s, o, f, js, fjs) {
    w["lulai_widget"] = o;
    w[o] = w[o] || 
      function () {
        (w[o].q = w[o].q || []).push(arguments);
      };
    js = d.createElement(s), (fjs = d.getElementsByTagName(s)[0]);
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(window, document, "script", "lulai", 
  "https://cdn.lulai.com/widget.min.js");
  
  Lulai("init", {
    serviceBaseUrl: "https://api.lulai.com/v1",
    token: "${agent.id}",
    theme: "light"
  });
</script>`;
  };

  // Handle copying code to clipboard
  const handleCopyCode = () => {
    const codeToCopy = generateJavaScriptCode();
    
    navigator.clipboard.writeText(codeToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  };

  // Handle adding a new allowed host
  const handleAddHost = () => {
    if (!newHost.trim()) {
      setHostError('Please enter a domain');
      return;
    }
    
    // Simple domain validation
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newHost)) {
      setHostError('Please enter a valid domain (e.g., example.com)');
      return;
    }
    
    if (allowedHosts.includes(newHost)) {
      setHostError('This domain is already added');
      return;
    }
    
    setAllowedHosts([...allowedHosts, newHost]);
    setNewHost('');
    setHostError(null);
    setShowAddHost(false);
  };

  // Handle removing an allowed host
  const handleRemoveHost = (host: string) => {
    setAllowedHosts(allowedHosts.filter(h => h !== host));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
      >
        <MenuIcon className="w-5 h-5 text-gray-600" />
      </button>

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`
        flex-1 transition-all duration-300
        ${isSidebarOpen ? 'ml-64' : 'ml-0'}
       
      `}>
        {/* Navigation shows only on agent detail pages - pass the ID from path */}
        <AgentNavigation agentId={agentId || ''} />

        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading integrations...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Integrations Content */}
          {!isLoading && !error && agent && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Integrations</h1>
              
              {/* Website Integration Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-gray-700" />
                    Connect with your website visitors
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Embed {agent.name} on your website to chat with your visitors
                  </p>
                </div>
                
                {/* JavaScript Label */}
                <div className="border-b border-gray-200 bg-gray-50">
                  <div className="px-6 py-3">
                    <span className="text-sm font-medium text-gray-700">JavaScript</span>
                  </div>
                </div>
                
                {/* Allowed Hosts Warning */}
                {allowedHosts.length === 0 && (
                  <div className="bg-red-50 p-4 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      Please add allowed hosts for widget to work, it's mandatory for the JavaScript embed
                    </p>
                  </div>
                )}
                
                {/* Allowed Hosts Management */}
                <div className="p-6 border-b border-gray-200">

                  
                  {/* Domain List */}

                  
                  {/* Add Domain Form */}
                  {showAddHost && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                      <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                        Domain Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="domain"
                          placeholder="example.com"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={newHost}
                          onChange={(e) => {
                            setNewHost(e.target.value);
                            setHostError(null);
                          }}
                        />
                        <button
                          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                          onClick={handleAddHost}
                        >
                          Add
                        </button>
                      </div>
                      {hostError && (
                        <p className="mt-1 text-sm text-red-600">{hostError}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Enter the domain without protocol (e.g., example.com, not https://example.com)
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Code Snippet */}
                <div className="p-6">
                  <p className="text-sm text-gray-700 mb-3">
                    Paste the code snippet below in your HTML code where you want to display the {agent.name} chatbot.
                  </p>
                  
                  <div className="relative">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 overflow-auto max-h-80">
                      <pre className="text-sm font-mono whitespace-pre">
                        {generateJavaScriptCode()}
                      </pre>
                    </div>
                    
                    <button
                      className="absolute top-2 right-2 p-2 bg-white rounded shadow hover:bg-gray-50"
                      onClick={handleCopyCode}
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-indigo-600">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <a href="#" className="hover:underline">
                      Learn more about using Embed Script
                    </a>
                  </div>
                </div>
              </div>
              
              {/* API Access Section */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold flex items-center">
                    <Code className="w-5 h-5 mr-2 text-gray-700" />
                    API Access
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Connect your applications to {agent.name} using our REST API
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">API Endpoint</h3>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <code className="flex-1 text-sm font-mono">https://api.lulai.com/v1/agents/{agent.id}</code>
                      <button
                        className="p-2 hover:bg-gray-100 rounded"
                        onClick={() => {
                          navigator.clipboard.writeText(`https://api.lulai.com/v1/agents/${agent.id}`);
                        }}
                      >
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">API Key</h3>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-3">
                      <div className="flex-1 text-sm font-mono">
                        <span className="text-gray-500">••••••••••••••••••••••••••</span>
                      </div>
                      <button
                        className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                      >
                        Generate Key
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      API keys are sensitive. Never expose them in client-side code.
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-indigo-600">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    <a href="#" className="hover:underline">
                      View API Documentation
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Additional Integrations */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-gray-700" />
                    More Integrations
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Connect {agent.name} to other platforms
                  </p>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
   
                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
                    <div className="flex items-center mb-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg" alt="Twitter" className="w-6 h-6 mr-2" />
                      <h3 className="font-medium">Twitter</h3>
                    </div>
                    <p className="text-sm text-gray-600">Connect {agent.name} to Twitter DMs</p>
                  </div>
                  

                  
                  <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer transition-colors">
                    <div className="flex items-center mb-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" className="w-6 h-6 mr-2" />
                      <h3 className="font-medium">Instagram</h3>
                    </div>
                    <p className="text-sm text-gray-600">Connect {agent.name} to Instagram DMs</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentIntegrationsPage;