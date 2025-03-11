'use client';
import { FC, useState } from 'react';
import { MoreHorizontalIcon, AlertCircleIcon, MessageSquareIcon, BugIcon, UserIcon, SendIcon } from 'lucide-react';

// Types
interface SupportTicket {
  id: string;
  clientName: string;
  issue: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
  responseTime?: number; // in hours
}

interface DebugSession {
  id: string;
  clientName: string;
  chatbotId: string;
  startedAt: string;
  status: 'active' | 'ended';
  messages: DebugMessage[];
}

interface DebugMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  overridden?: boolean;
}

// Support Ticket Dashboard Component
interface SupportTicketDashboardProps {
  tickets: SupportTicket[];
  onAssign: (ticketId: string, assignee: string) => void;
  onResolve: (ticketId: string) => void;
}

const SupportTicketDashboard: FC<SupportTicketDashboardProps> = ({ tickets, onAssign, onResolve }) => {
  const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const inProgressTickets = tickets.filter(ticket => ticket.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved').length;
  const avgResponseTime = tickets.reduce((sum, ticket) => sum + (ticket.responseTime || 0), 0) / tickets.length;

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Support Ticket Dashboard</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Open Tickets</h3>
          <p className="text-2xl font-bold text-blue-600">{openTickets}</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">In Progress</h3>
          <p className="text-2xl font-bold text-yellow-600">{inProgressTickets}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Resolved Tickets</h3>
          <p className="text-2xl font-bold text-green-600">{resolvedTickets}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Avg. Response Time</h3>
          <p className="text-2xl font-bold text-purple-600">{avgResponseTime.toFixed(1)}h</p>
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
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {ticket.assignedTo || (
                    <button
                      onClick={() => {
                        const assignee = prompt('Enter assignee name:');
                        if (assignee) onAssign(ticket.id, assignee);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Assign
                    </button>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {ticket.status !== 'resolved' && (
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
    </div>
  );
};

// Live Debugging Component
interface LiveDebuggingProps {
  debugSessions: DebugSession[];
  onStartSession: (clientName: string, chatbotId: string) => void;
  onEndSession: (sessionId: string) => void;
  onSendMessage: (sessionId: string, message: string) => void;
  onOverrideMessage: (sessionId: string, messageId: string, newText: string) => void;
}

const LiveDebugging: FC<LiveDebuggingProps> = ({ debugSessions, onStartSession, onEndSession, onSendMessage, onOverrideMessage }) => {
  const [newMessage, setNewMessage] = useState('');

  const activeSession = debugSessions.find(session => session.status === 'active');

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <BugIcon className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Live Debugging</h2>
        </div>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {!activeSession ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">No active debug session</p>
          <button
            onClick={() => {
              const clientName = prompt('Enter client name:');
              const chatbotId = prompt('Enter chatbot ID:');
              if (clientName && chatbotId) onStartSession(clientName, chatbotId);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Start Debug Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{activeSession.clientName}</p>
                <p className="text-sm text-gray-500">Chatbot ID: {activeSession.chatbotId}</p>
              </div>
              <button
                onClick={() => onEndSession(activeSession.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                End Session
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {activeSession.messages.map(message => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-lg max-w-[70%] ${
                  message.sender === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <p>{message.text}</p>
                  {message.overridden && (
                    <p className="text-xs text-gray-500">(Overridden)</p>
                  )}
                  {message.sender === 'bot' && !message.overridden && (
                    <button
                      onClick={() => {
                        const newText = prompt('Override message:', message.text);
                        if (newText) onOverrideMessage(activeSession.id, message.id, newText);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Override
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded"
              placeholder="Type a message..."
            />
            <button
              onClick={() => {
                onSendMessage(activeSession.id, newMessage);
                setNewMessage('');
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
interface SupportManagementProps {
  initialData?: {
    tickets: SupportTicket[];
    debugSessions: DebugSession[];
  };
}

const SupportManagement: FC<SupportManagementProps> = ({ initialData = {
  tickets: [
    {
      id: '1',
      clientName: 'Client A',
      issue: 'Chatbot not responding',
      status: 'open',
      createdAt: '2023-10-01T10:00:00Z',
      responseTime: 2,
    },
    {
      id: '2',
      clientName: 'Client B',
      issue: 'Incorrect responses from chatbot',
      status: 'in_progress',
      assignedTo: 'John Doe',
      createdAt: '2023-10-02T12:00:00Z',
      updatedAt: '2023-10-02T14:00:00Z',
      responseTime: 1.5,
    },
    {
      id: '3',
      clientName: 'Client C',
      issue: 'Integration failure with Shopify',
      status: 'resolved',
      assignedTo: 'Jane Smith',
      createdAt: '2023-10-03T09:00:00Z',
      updatedAt: '2023-10-03T11:00:00Z',
      responseTime: 3,
    },
  ],
  debugSessions: [
    {
      id: '1',
      clientName: 'Client A',
      chatbotId: 'chatbot_123',
      startedAt: '2023-10-01T10:00:00Z',
      status: 'ended',
      messages: [
        {
          id: '1',
          sender: 'user',
          text: 'Hello, my chatbot is not working.',
          timestamp: '2023-10-01T10:05:00Z',
        },
        {
          id: '2',
          sender: 'bot',
          text: 'Hi! How can I assist you today?',
          timestamp: '2023-10-01T10:06:00Z',
        },
      ],
    },
  ],
} }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(initialData.tickets);
  const [debugSessions, setDebugSessions] = useState<DebugSession[]>(initialData.debugSessions);

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, assignedTo: assignee, status: 'in_progress' } : ticket
    ));
  };

  const handleResolveTicket = (ticketId: string) => {
    setTickets(tickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, status: 'resolved', updatedAt: new Date().toISOString() } : ticket
    ));
  };

  const handleStartDebugSession = (clientName: string, chatbotId: string) => {
    const newSession: DebugSession = {
      id: Date.now().toString(),
      clientName,
      chatbotId,
      startedAt: new Date().toISOString(),
      status: 'active',
      messages: [],
    };
    setDebugSessions([...debugSessions, newSession]);
  };

  const handleEndDebugSession = (sessionId: string) => {
    setDebugSessions(debugSessions.map(session =>
      session.id === sessionId ? { ...session, status: 'ended' } : session
    ));
  };

  const handleSendMessage = (sessionId: string, message: string) => {
    setDebugSessions(debugSessions.map(session =>
      session.id === sessionId ? {
        ...session,
        messages: [
          ...session.messages,
          { id: Date.now().toString(), sender: 'user', text: message, timestamp: new Date().toISOString() },
        ],
      } : session
    ));
  };

  const handleOverrideMessage = (sessionId: string, messageId: string, newText: string) => {
    setDebugSessions(debugSessions.map(session =>
      session.id === sessionId ? {
        ...session,
        messages: session.messages.map(message =>
          message.id === messageId ? { ...message, text: newText, overridden: true } : message
        ),
      } : session
    ));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Support Management</h1>

      <SupportTicketDashboard
        tickets={tickets}
        onAssign={handleAssignTicket}
        onResolve={handleResolveTicket}
      />

      <LiveDebugging
        debugSessions={debugSessions}
        onStartSession={handleStartDebugSession}
        onEndSession={handleEndDebugSession}
        onSendMessage={handleSendMessage}
        onOverrideMessage={handleOverrideMessage}
      />
    </div>
  );
};

export default SupportManagement;