'use client';

import React from 'react';
import SidebarWrapper from '@/components/Sidebar/SidebarWrapper';
import { BotDetailsDashboard } from '@/components/BotDetails/BotDetailsDashboard';

// Define the interface for bot details
export interface BotDetailsClientProps {
  botDetails: {
    id: string;
    name: string;
    description?: string | null;
    model_type: string;
    created_at: string; // ISO string
    appearance?: {
      bot_avatar?: string | null;
      company_logo?: string | null;
      accent_color?: string | null;
    } | null;
  } | null;
  userData: {
    firstName: string;
    lastName: string;
  };
}

// Use named export
export const BotDetailsClient: React.FC<BotDetailsClientProps> = ({ botDetails, userData }) => {
  // Parse the date string back to Date object
  const parsedBotDetails = botDetails ? {
    ...botDetails,
    created_at: new Date(botDetails.created_at)
  } : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarWrapper userData={userData}>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {parsedBotDetails && <BotDetailsDashboard bot={parsedBotDetails} />}
          </div>
        </div>
      </SidebarWrapper>
    </div>
  );
};

// Add default export to maintain compatibility
export default BotDetailsClient;