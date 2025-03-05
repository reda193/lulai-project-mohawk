import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import BotDetailsClient from "./client";

// Use async for the page component
export default async function BotDetailsPage({ 
  params 
}: { 
  params: { botId: string } 
}) {
  // Await the params object (though in this case, it's not strictly necessary)
  const resolvedParams = await params;

  // Get session on server
  const session = await getServerSession(authOptions);
  
  // Check authentication
  if (!session) {
    redirect('/auth/signin');
  }
  
  // Get bot details
  let botDetails = null;
  
  try {
    if (session.user?.email) {
      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (user) {
        const bot = await db.bot.findFirst({
          where: {
            // Use the botId directly from params
            id: resolvedParams.botId,
            creator_id: user.userId
          },
          include: {
            appearance: true
          }
        });
        
        if (!bot) {
          redirect('/dashboard'); // Bot not found or doesn't belong to user
        }
        
        botDetails = {
          id: bot.id,
          name: bot.bot_name,
          description: bot.description,
          model_type: bot.model_type,
          created_at: bot.created_at,
          appearance: bot.appearance?.[0] ? {
            bot_avatar: bot.appearance[0].bot_avatar,
            company_logo: bot.appearance[0].company_logo,
            accent_color: bot.appearance[0].accent_color
          } : null
        };
      }
    }
  } catch (error) {
    console.error('Error fetching bot details:', error);
    redirect('/dashboard');
  }
  
  // User data for sidebar
  const userData = {
    firstName: session.user?.first_name || '',
    lastName: session.user?.last_name || ''
  };

  // Serialize date for passing to client component
  const serializedBotDetails = botDetails ? {
    ...botDetails,
    created_at: botDetails.created_at.toISOString()
  } : null;

  return <BotDetailsClient botDetails={serializedBotDetails} userData={userData} />;
}