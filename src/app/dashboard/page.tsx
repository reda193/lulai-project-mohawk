// app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Customer } from '@/types/dashboard';
import { db } from "@/lib/db";

// Import components
import SidebarWrapper from '@/components/Sidebar/SidebarWrapper';
import ChatbotAgentSlider from '@/components/ChatbotAgents/ChatbotAgentSlider';
import VisitorsMap from '@/components/Analytics/VisitorsMap';
import RepliesChart from '@/components/Analytics/RepliesChart';
import CustomerTable from '@/components/Customers/CustomerTable';
import CreateAgentButton from '@/components/CreateAgent/CreateAgentButton';

// Define interfaces to match what the component expects
interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface ChatbotAgent {
  id: string;
  name: string;
  status: string;
  appearance?: BotAppearance | null;
}

export default async function DashboardPage() {
  // Get session on server
  const session = await getServerSession(authOptions);
  
  // Check authentication
  if (!session) {
    redirect('/');
  }
  
  // Explicitly type the chatbotAgents array
  let chatbotAgents: ChatbotAgent[] = [];
  

  
  try {
    // Fetch bots directly from the database
    if (session.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (user) {

        const bots = await db.bot.findMany({
          where: {
            creator_id: user.userId
          },
          include: {
            appearance: true
          },
          orderBy: {
            created_at: 'desc'
          }
        });
        
        // Map to the expected format with explicit typing
        chatbotAgents = bots.map(bot => ({
          id: bot.id,
          name: bot.bot_name,
          status: 'Active', // Default status
          appearance: bot.appearance?.[0] ? {
            bot_avatar: bot.appearance[0].bot_avatar,
            company_logo: bot.appearance[0].company_logo,
            accent_color: bot.appearance[0].accent_color
          } : null
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching bots:', error);
    
    // Fallback data in case the database query fails
    chatbotAgents = [
      { id: '1', name: 'Shopify', status: 'Active' },
      { id: '2', name: 'Testing', status: 'Active' },
      { id: '3', name: 'Shopify GA', status: 'Active' },
    ];
  }

  // This would come from your database or API
  const topCustomers: Customer[] = [
    { name: 'John Doe', total: '$8,000.00', country: 'USA', date: '2023-10-15', status: 'Active' },
    { name: 'Jane Smith', total: '$5,000.00', country: 'Canada', date: '2023-10-15', status: 'Pending' },
    { name: 'Michael Johnson', total: '$4,000.00', country: 'UK', date: '2023-10-15', status: 'Pending' },
    { name: 'Emily Brown', total: '$3,500.00', country: 'Australia', date: '2023-10-15', status: 'Active' },
    { name: 'David Wilson', total: '$3,000.00', country: 'Germany', date: '2023-10-15', status: 'Active' },
  ];

  // Enhanced user data for sidebar, now including role
  const userData = {
    firstName: session.user?.first_name || '',
    lastName: session.user?.last_name || '',
    role: session.user?.role 
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Wrapper now contains the main content as children and receives user role */}
      <SidebarWrapper userData={userData}>
        {/* Main Content - No longer needs ml-64 as it's now dynamic in SidebarWrapper */}
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Home</h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            </header>

            {/* Create New Agent Section */}
            <div className="bg-gray-100 p-4 rounded-lg mb-8">
              <CreateAgentButton />
            </div>

            {/* Chatbot Agents Slider - replaces the grid */}
            <section className="mb-8">
              <ChatbotAgentSlider agents={chatbotAgents} />
            </section>

            {/* Quick Analytics */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Quick Analytics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <VisitorsMap  /> 
                <RepliesChart data={[]} /> 
              </div>
            </section>

            {/* Top Customers */}
            <section className="mb-8">
              <CustomerTable customers={topCustomers} />
            </section>
          </div>
        </div>
      </SidebarWrapper>
    </div>
  );
}