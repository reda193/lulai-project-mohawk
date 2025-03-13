import { PrismaClient, BotModel } from '@prisma/client';
import { randomUUID } from 'crypto';
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  
  // Clean up existing data if needed
  await prisma.csat.deleteMany({});
  await prisma.conv_Messages.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.bot_Appearance.deleteMany({});
  await prisma.bot.deleteMany({});
  await prisma.user.deleteMany({});
  
  // Hash the password
  const hashedPassword = await hash('Lebanon4life1!', 10);
  
  // Create test user
  const user = await prisma.user.create({
    data: {
      userId: randomUUID(),
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      verified: true,
      role: 'MEMBER',
    }
  });
  
  console.log(`Created user: ${user.email}`);
  
  // Create a few bots for testing
  const botModels = [
    BotModel.GPT_3_5_TURBO,
    BotModel.GPT_4,
    BotModel.CLAUDE_3_SONNET
  ];
  
  const botNames = [
    'Customer Support Bot',
    'Sales Assistant',
    'Technical Help Bot'
  ];
  
  const bots = [];
  
  for (let i = 0; i < 3; i++) {
    // Let Prisma handle the ID generation
    const bot = await prisma.bot.create({
      data: {
        bot_name: botNames[i],
        description: `A bot that helps with ${botNames[i].toLowerCase()}`,
        purpose: `To provide ${botNames[i].toLowerCase()} assistance`,
        model_type: botModels[i],
        creator_id: user.userId,
        appearance: {
          create: {
            accent_color: '#4F46E5',
            branding_enabled: true,
            widget_open_by_default: false,
            starter_questions: true
          }
        }
      }
    });
    
    bots.push(bot);
    console.log(`Created bot: ${bot.bot_name}`);
  }
  
  // Generate conversations and CSAT ratings over the last 90 days
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);
  
  // CSAT distribution patterns - slightly different for each bot
  // Format: [veryDissatisfied, dissatisfied, neutral, satisfied, verySatisfied]
  const csatDistributions = [
    [5, 10, 15, 30, 40],  // Customer Support Bot
    [3, 7, 20, 35, 35],   // Sales Assistant 
    [2, 5, 13, 35, 45]    // Technical Help Bot
  ];
  
  // Total number of conversations per bot
  const totalConversations = [120, 90, 150];
  
  for (let botIndex = 0; botIndex < bots.length; botIndex++) {
    const bot = bots[botIndex];
    const conversationCount = totalConversations[botIndex];
    const distribution = csatDistributions[botIndex];
    
    console.log(`Generating ${conversationCount} conversations for ${bot.bot_name}...`);
    
    for (let i = 0; i < conversationCount; i++) {
      // Generate a random date within the last 90 days
      const randomDaysAgo = Math.floor(Math.random() * 90);
      const conversationDate = new Date(now);
      conversationDate.setDate(now.getDate() - randomDaysAgo);
      
      // Some conversations will be longer than others
      const durationMinutes = Math.floor(Math.random() * 20) + 1;
      const endTime = new Date(conversationDate);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);
      
      // Generate sentiment score between -1 and 1
      const sentimentScore = (Math.random() * 2 - 1).toFixed(2);
      
      // Create the conversation
      const conversation = await prisma.conversation.create({
        data: {
          id: randomUUID(),
          bot_id: bot.id,
          start_time: conversationDate,
          end_time: endTime,
          escalated: Math.random() < 0.15, // 15% escalation rate
          resolution_status: Math.random() < 0.9 ? 'RESOLVED' : 'UNRESOLVED',
          minutes: durationMinutes,
          sentiment_score: parseFloat(sentimentScore)
        }
      });
      
      // Create between 3 and 10 messages for this conversation
      const messageCount = Math.floor(Math.random() * 8) + 3;
      const messageStartTime = new Date(conversationDate);
      
      for (let j = 0; j < messageCount; j++) {
        const isBot = j % 2 === 1; // Alternate between user and bot
        const messageTime = new Date(messageStartTime);
        messageTime.setMinutes(messageTime.getMinutes() + Math.floor(j * durationMinutes / messageCount));
        
        await prisma.conv_Messages.create({
          data: {
            id: randomUUID(),
            conversation_id: conversation.id,
            sender_type: isBot ? 'BOT' : 'USER',
            message_text: isBot 
              ? `Bot response ${j / 2 + 1}` 
              : `User message ${Math.floor(j / 2) + 1}`,
            sent_at: messageTime,
            response_time: isBot ? Math.floor(Math.random() * 5000) + 500 : null,
            used_knowledge_base: isBot && Math.random() < 0.4
          }
        });
      }
      
      // 80% of conversations will have CSAT ratings
      if (Math.random() < 0.8) {
        // Determine the rating based on the distribution for this bot
        let rating = 0;
        const rand = Math.random() * 100;
        let cumulativeProb = 0;
        
        for (let r = 0; r < distribution.length; r++) {
          cumulativeProb += distribution[r];
          if (rand <= cumulativeProb) {
            rating = r + 1; // Ratings are 1-5
            break;
          }
        }
        
        if (rating === 0) rating = 5; // Fallback
        
        // CSAT is usually submitted shortly after conversation ends
        const feedbackTime = new Date(endTime);
        feedbackTime.setMinutes(feedbackTime.getMinutes() + Math.floor(Math.random() * 10) + 1);
        
        await prisma.csat.create({
          data: {
            id: randomUUID(),
            conversation_id: conversation.id,
            rating_score: rating,
            feedback_at: feedbackTime,
            submitted_at: feedbackTime
          }
        });
      }
    }
  }
  
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });