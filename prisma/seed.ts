import { PrismaClient, BotModel, Role, PlanType, SubStatus, TicketStatus, TicketPriority, TicketType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');
  
  // Clean up existing data in reverse order of dependencies
  await prisma.csat.deleteMany({});
  await prisma.unrecognizedQueries.deleteMany({});
  await prisma.knowledge_Queries.deleteMany({});
  await prisma.conv_Messages.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.training_Coverage.deleteMany({});
  await prisma.bot_Training.deleteMany({});
  await prisma.bot_QA.deleteMany({});
  await prisma.bot_Appearance.deleteMany({});
  // Clean up ticket tables
  await prisma.ticketAttachment.deleteMany({});
  await prisma.ticketComment.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.ticketMetrics.deleteMany({});
  await prisma.bot.deleteMany({});
  await prisma.subscriptionItem.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.userOnboarding.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  
  // Hash the password
  const hashedPassword = await hash('Admintest123!', 10);
  
  // Create test users with different roles
  const users = [];

  // Admin user
  const adminUser = await prisma.user.create({
    data: {
      userId: randomUUID(),
      email: 'admin@example.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      verified: true,
      role: 'ADMIN',
      lastLogin: new Date(),
      onboarding: {
        create: {
          completed: true,
          discovery_source: 'Referral',
          switching_from: 'Competitor',
          completed_at: new Date()
        }
      },
      subscription: {
        create: {
          plan_type: PlanType.PRO,
          status: SubStatus.ACTIVE,
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          subscription_items: {
            create: {
              price_id: 'price_pro_monthly',
              quantity: 1
            }
          }
        }
      }
    }
  });
  
  users.push(adminUser);
  console.log(`Created admin user: ${adminUser.email}`);
  
  // Regular member user
  const memberUser = await prisma.user.create({
    data: {
      userId: randomUUID(),
      email: 'test@example.com',
      password: hashedPassword,
      first_name: 'Test',
      last_name: 'User',
      verified: true,
      role: Role.MEMBER,
      lastLogin: new Date(),
      onboarding: {
        create: {
          completed: true,
          discovery_source: 'Google',
          switching_from: 'None',
          completed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
        }
      },
      subscription: {
        create: {
          plan_type: PlanType.BASIC,
          status: SubStatus.ACTIVE,
          current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          subscription_items: {
            create: {
              price_id: 'price_basic_monthly',
              quantity: 1
            }
          }
        }
      }
    }
  });
  
  users.push(memberUser);
  console.log(`Created member user: ${memberUser.email}`);

  // Free tier user
  const freeUser = await prisma.user.create({
    data: {
      userId: randomUUID(),
      email: 'free@example.com',
      password: hashedPassword,
      first_name: 'Free',
      last_name: 'User',
      verified: true,
      role: Role.MEMBER,
      lastLogin: new Date(),
      onboarding: {
        create: {
          completed: false,
          discovery_source: 'Social Media',
        }
      },
      subscription: {
        create: {
          plan_type: PlanType.FREE,
          status: SubStatus.ACTIVE,
          current_period_start: new Date(),
          current_period_end: null, // Free plan doesn't expire
        }
      }
    }
  });
  
  users.push(freeUser);
  console.log(`Created free user: ${freeUser.email}`);
  
  // Create a few social logins for the first user
  await prisma.account.create({
    data: {
      userId: adminUser.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: '12345',
      access_token: 'google-mock-access-token',
      id_token: 'google-mock-id-token',
      scope: 'email profile',
      token_type: 'Bearer',
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  });
  
  console.log(`Created Google account for admin user`);
  
  // Create active session for admin
  await prisma.session.create({
    data: {
      userId: adminUser.id,
      sessionToken: randomUUID(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  });
  
  console.log(`Created session for admin user`);
  
  // Create bots for each user with different configurations
  const botModels = [
    BotModel.GPT_3_5_TURBO,
    BotModel.GPT_4,
    BotModel.CLAUDE_3_SONNET,
    BotModel.CLAUDE_3_HAIKU,
    BotModel.CLAUDE_3_OPUS,
    BotModel.GEMINI_PRO
  ];
  
  const botNames = [
    'Customer Support Bot',
    'Sales Assistant',
    'Technical Help Bot',
    'Product Recommender',
    'IT Assistant',
    'Marketing Helper'
  ];
  
  const botDescriptions = [
    'A bot that helps with customer inquiries and support tickets',
    'An assistant to help with sales processes and lead qualification',
    'A bot that provides technical assistance and troubleshooting',
    'A smart bot that recommends products based on customer needs',
    'An assistant that helps with IT-related questions and issues',
    'A helper for marketing tasks and campaign ideas'
  ];
  
  const categories = [
    'Support',
    'Sales',
    'Technical',
    'Product',
    'IT',
    'Marketing'
  ];
  
  const colorOptions = [
    '#4F46E5', // Indigo
    '#DC2626', // Red
    '#059669', // Green
    '#D97706', // Amber
    '#7C3AED', // Purple
    '#2563EB'  // Blue
  ];
  
  const allBots = [];
  
  // Create 2 bots for each user
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < 2; j++) {
      const index = i * 2 + j;
      const botIndex = index % botNames.length;
      
      const bot = await prisma.bot.create({
        data: {
          bot_name: `${users[i].first_name}'s ${botNames[botIndex]}`,
          description: botDescriptions[botIndex],
          purpose: `To provide ${botNames[botIndex].toLowerCase()} assistance`,
          company_size: ['Small', 'Medium', 'Enterprise'][Math.floor(Math.random() * 3)],
          company_type: ['B2B', 'B2C', 'Both'][Math.floor(Math.random() * 3)],
          use_case_category: categories[botIndex],
          use_case_description: `This bot is designed to help with ${categories[botIndex].toLowerCase()} tasks`,
          target_audience: ['Customers', 'Employees', 'Partners'][Math.floor(Math.random() * 3)],
          privacy_level: ['Public', 'Private', 'Restricted'][Math.floor(Math.random() * 3)],
          model_type: botModels[botIndex % botModels.length],
          creator_id: users[i].userId,
          appearance: {
            create: {
              accent_color: colorOptions[index % colorOptions.length],
              branding_enabled: Math.random() > 0.3,
              widget_open_by_default: Math.random() > 0.7,
              starter_questions: Math.random() > 0.2,
              widget_position: ['bottom-right', 'bottom-left'][Math.floor(Math.random() * 2)],
              input_placeholder: 'Ask me anything...'
            }
          }
        }
      });
      
      allBots.push(bot);
      console.log(`Created bot: ${bot.bot_name} for user ${users[i].email}`);
      
      // Create some QA pairs for each bot
      const qaCount = Math.floor(Math.random() * 5) + 5; // 5-10 QA pairs
      for (let k = 0; k < qaCount; k++) {
        await prisma.bot_QA.create({
          data: {
            bot_id: bot.id,
            question: `Common question ${k + 1} about ${categories[botIndex]}?`,
            answer: `Detailed answer to question ${k + 1} about ${categories[botIndex]}.`,
            category: categories[botIndex],
            is_active: Math.random() > 0.1 // 90% active
          }
        });
      }
      
      // Create bot training entries
      const trainingCount = Math.floor(Math.random() * 3) + 2; // 2-5 training entries
      for (let k = 0; k < trainingCount; k++) {
        await prisma.bot_Training.create({
          data: {
            bot_id: bot.id,
            prompt_type: ['Base Knowledge', 'Persona', 'Tone', 'Specific Response'][Math.floor(Math.random() * 4)],
            prompt_content: `Training content for ${categories[botIndex]} bot`,
            category: categories[botIndex],
            context: `Context for training entry ${k + 1}`
          }
        });
      }
      
      // Create training coverage metrics
      await prisma.training_Coverage.create({
        data: {
          bot_id: bot.id,
          total_unique_queries: Math.floor(Math.random() * 500) + 100,
          covered_intents: Math.floor(Math.random() * 40) + 10
        }
      });
    }
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
    [2, 5, 13, 35, 45],   // Technical Help Bot
    [4, 6, 20, 30, 40],   // Product Recommender
    [1, 4, 15, 40, 40],   // IT Assistant
    [2, 8, 12, 38, 40]    // Marketing Helper
  ];
  
  // Total number of conversations per bot (varies by bot type)
  const conversationCountByType: Record<string, number> = {
    'Customer Support Bot': 120,
    'Sales Assistant': 90,
    'Technical Help Bot': 150,
    'Product Recommender': 80,
    'IT Assistant': 110,
    'Marketing Helper': 70
  };
  
  for (const bot of allBots) {
    // Extract the bot type from the name
    const botTypeParts = bot.bot_name.split("'s ");
    const botType = botTypeParts.length > 1 ? botTypeParts[1] : botTypeParts[0];
    
    // Find the base bot type to determine conversation count and distribution
    const baseType = Object.keys(conversationCountByType).find(type => botType.includes(type)) || 'Customer Support Bot';
    
    // Determine conversation count (some variance for the same bot types)
    const baseCount = conversationCountByType[baseType] || 100; // Default to 100 if type not found
    const varianceFactor = 0.7 + Math.random() * 0.6; // 70% to 130% of base count
    const conversationCount = Math.floor(baseCount * varianceFactor);
    
    // Get CSAT distribution for this bot type
    const botTypeIndex = Object.keys(conversationCountByType).indexOf(baseType);
    const distribution = csatDistributions[botTypeIndex >= 0 ? botTypeIndex : 0];
    
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
      
      // Track the last message to potentially add knowledge queries or unrecognized queries
      let lastBotMessage = null;
      
      for (let j = 0; j < messageCount; j++) {
        const isBot = j % 2 === 1; // Alternate between user and bot
        const messageTime = new Date(messageStartTime);
        messageTime.setMinutes(messageTime.getMinutes() + Math.floor(j * durationMinutes / messageCount));
        
        const usedKnowledgeBase = isBot && Math.random() < 0.4;
        
        const message = await prisma.conv_Messages.create({
          data: {
            conversation_id: conversation.id,
            sender_type: isBot ? 'BOT' : 'USER',
            message_text: isBot 
              ? `Bot response ${j / 2 + 1} for ${bot.bot_name}` 
              : `User message ${Math.floor(j / 2) + 1} about ${baseType.toLowerCase()}`,
            sent_at: messageTime,
            response_time: isBot ? Math.floor(Math.random() * 5000) + 500 : null,
            used_knowledge_base: usedKnowledgeBase
          }
        });
        
        if (isBot) {
          lastBotMessage = message;
          
          // Add knowledge queries for some bot messages
          if (usedKnowledgeBase) {
            const queryCount = Math.floor(Math.random() * 2) + 1; // 1-2 queries
            
            for (let k = 0; k < queryCount; k++) {
              await prisma.knowledge_Queries.create({
                data: {
                  message_id: message.id,
                  query_text: `Knowledge query ${k + 1} for ${baseType.toLowerCase()}`,
                  was_successful: Math.random() < 0.85, // 85% success rate
                  response_score: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
                  confidence_score: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
                }
              });
            }
          }
        } else {
          // Add unrecognized query for some user messages (only when the system doesn't understand)
          if (Math.random() < 0.15) { // 15% unrecognized rate
            await prisma.unrecognizedQueries.create({
              data: {
                message_id: message.id,
                query_text: `Unrecognized question about ${baseType.toLowerCase()}`,
                frequency: Math.floor(Math.random() * 3) + 1, // 1-3 frequency
                first_seen_at: new Date(messageTime),
                last_seen_at: new Date(messageTime)
              }
            });
          }
        }
      }
      
      // 80% of conversations will have CSAT ratings
      if (Math.random() < 0.8) {
        // Determine the rating based on the distribution for this bot type
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
            conversation_id: conversation.id,
            rating_score: rating,
            feedback_at: feedbackTime,
            submitted_at: feedbackTime
          }
        });
      }
    }
  }
  
  // Generate ticket data
  console.log('Generating ticket data...');
  
  // Sample ticket titles and descriptions for different ticket types
  const ticketTemplates = {
    ISSUE: [
      {
        title: 'Bot not responding to queries',
        description: 'My bot stops responding after 2-3 messages. This started happening yesterday.'
      },
      {
        title: 'Incorrect responses from bot',
        description: 'The bot is providing inaccurate information about our pricing plans.'
      },
      {
        title: 'Performance degradation',
        description: 'The bot has been much slower to respond in the last week.'
      }
    ],
    FEATURE_REQUEST: [
      {
        title: 'Add support for multiple languages',
        description: 'We need our bot to support Spanish and French in addition to English.'
      },
      {
        title: 'Implement file attachment handling',
        description: 'Would like the bot to accept and process PDF uploads from users.'
      },
      {
        title: 'Add analytics dashboard',
        description: 'Need a way to track bot performance and user satisfaction over time.'
      }
    ],
    BILLING: [
      {
        title: 'Incorrect charges on invoice',
        description: 'I was charged for the Pro plan but I only signed up for Basic.'
      },
      {
        title: 'Unable to update payment method',
        description: 'The system rejects my new credit card information every time.'
      },
      {
        title: 'Request for refund',
        description: 'The service did not meet our expectations. Requesting a partial refund.'
      }
    ],
    QUESTION: [
      {
        title: 'How to customize bot appearance?',
        description: 'I need instructions on changing the bot avatar and color scheme.'
      },
      {
        title: 'Integration with our CRM',
        description: 'Can the bot be integrated with Salesforce? What are the steps?'
      },
      {
        title: 'Maximum number of bots allowed',
        description: 'How many bots can I create under my current plan?'
      }
    ],
    INTEGRATION: [
      {
        title: 'API authentication failing',
        description: 'Getting 401 errors when trying to connect to the API with provided credentials.'
      },
      {
        title: 'Webhook setup instructions',
        description: 'Need help setting up webhooks to receive bot conversation data.'
      },
      {
        title: 'Custom integration development',
        description: 'Looking for guidance on developing a custom integration with our internal tools.'
      }
    ],
    OTHER: [
      {
        title: 'Account access issues',
        description: 'Unable to log in with correct credentials. No reset email arrives.'
      },
      {
        title: 'Data export request',
        description: 'Need to export all our bot conversation data for compliance purposes.'
      },
      {
        title: 'Request for consultation',
        description: 'Would like to schedule a call with a support specialist about bot optimization.'
      }
    ]
  };
  
  // Sample comments for tickets
  const ticketComments = [
    'I checked the logs and found some unusual patterns. Can you provide more details about when this started happening?',
    'This issue appears to be related to our recent update. We\'re working on a fix.',
    'I\'ve escalated this to our engineering team. They\'ll investigate and get back to you within 24 hours.',
    'Thanks for your patience. We\'ve identified the root cause and are implementing a solution.',
    'Could you please try clearing your cache and let us know if the issue persists?',
    'This feature is on our roadmap for Q3. I\'ll add your vote to prioritize it.',
    'We\'ve deployed a fix. Please let us know if you still experience this issue.',
    'I\'ve issued a credit to your account for the inconvenience caused.',
    'This is an expected behavior based on your current plan. You would need to upgrade to access this feature.',
    'I\'ve attached documentation that should help with this process.'
  ];
  
  // Sample file types for attachments
  const fileTypes = [
    { type: 'image/png', extension: 'png', sizeRange: [50, 500] },
    { type: 'image/jpeg', extension: 'jpg', sizeRange: [100, 1000] },
    { type: 'application/pdf', extension: 'pdf', sizeRange: [200, 2000] },
    { type: 'text/plain', extension: 'txt', sizeRange: [5, 100] },
    { type: 'application/json', extension: 'json', sizeRange: [10, 200] },
    { type: 'application/zip', extension: 'zip', sizeRange: [500, 5000] }
  ];
  
  // Generate a specific number of tickets for each user
  const ticketsPerUser = {
    [adminUser.id]: 5, 
    [memberUser.id]: 10,
    [freeUser.id]: 3
  };
  
  // Create metrics for the last 30 days
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);
  
  for (let i = 0; i <= 30; i++) {
    const metricDate = new Date(thirtyDaysAgo);
    metricDate.setDate(thirtyDaysAgo.getDate() + i);
    
    // Start with some base metrics that increase slightly over time
    const baseOpen = 5 + Math.floor(i / 3);
    const baseInProgress = 3 + Math.floor(i / 5);
    const baseResolved = 4 + Math.floor(i / 2);
    
    // Add some random variation
    const randomVariation = () => Math.floor(Math.random() * 5) - 2;
    
    const open = Math.max(0, baseOpen + randomVariation());
    const inProgress = Math.max(0, baseInProgress + randomVariation());
    const resolved = Math.max(0, baseResolved + randomVariation());
    const total = open + inProgress + resolved;
    
    await prisma.ticketMetrics.create({
      data: {
        date: metricDate,
        total_tickets: total,
        open_tickets: open,
        in_progress_tickets: inProgress,
        resolved_tickets: resolved,
        avg_response_time: 2 + Math.random() * 10, // 2-12 hours
        avg_resolution_time: 24 + Math.random() * 48 // 24-72 hours
      }
    });
  }
  
  // Track all tickets for reference in comments and attachments
  const allTickets = [];
  
  // Create tickets for each user
  for (const [userIdStr, ticketCount] of Object.entries(ticketsPerUser)) {
    const userId = parseInt(userIdStr);
    const user = users.find(u => u.id === userId);
    
    if (!user) continue;
    
    for (let i = 0; i < ticketCount; i++) {
      // Pick a random bot for this ticket
      const randomBot = allBots[Math.floor(Math.random() * allBots.length)];
      
      // Determine ticket type, priority, and status
      const ticketTypes = Object.keys(TicketType);
      const ticketType = ticketTypes[Math.floor(Math.random() * ticketTypes.length)] as TicketType;
      
      const priorityValues = Object.values(TicketPriority);
      const ticketPriority = priorityValues[Math.floor(Math.random() * priorityValues.length)];
      
      const statusValues = Object.values(TicketStatus);
      let ticketStatus = statusValues[Math.floor(Math.random() * statusValues.length)];
      
      // Template for this ticket type
      const templates = ticketTemplates[ticketType];
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      // Random creation date in the last 30 days
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const ticketDate = new Date(now);
      ticketDate.setDate(now.getDate() - randomDaysAgo);
      
      // Resolution date will be set if the ticket is resolved or closed
      let resolvedAt = null;
      if (ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED') {
        resolvedAt = new Date(ticketDate);
        resolvedAt.setHours(resolvedAt.getHours() + Math.floor(Math.random() * 72) + 1); // 1-72 hours later
      }
      
      // Response time in seconds (if applicable)
      const responseTime = Math.floor(Math.random() * 3600) + 300; // 5-65 minutes
      
      // Determine who solved the ticket (if applicable)
      let solvedById = null;
      if (ticketStatus === 'RESOLVED' || ticketStatus === 'CLOSED') {
        // Admin user typically resolves tickets
        solvedById = adminUser.id;
      }
      
      const ticket = await prisma.ticket.create({
        data: {
          title: template.title,
          description: template.description,
          status: ticketStatus,
          priority: ticketPriority,
          type: ticketType,
          client_id: userId,
          solved_by_id: solvedById,
          bot_id: randomBot.id,
          created_at: ticketDate,
          updated_at: resolvedAt || ticketDate,
          response_time: responseTime,
          resolved_at: resolvedAt
        }
      });
      
      allTickets.push(ticket);
      
      // Generate comments for this ticket
      const commentCount = Math.floor(Math.random() * 5) + 1; // 1-5 comments
      
      let commentDate = new Date(ticketDate);
      commentDate.setMinutes(commentDate.getMinutes() + 30); // First comment 30 minutes after ticket creation
      
      for (let j = 0; j < commentCount; j++) {
        // Alternate between client and support (admin) comments
        const commentUser = j % 2 === 0 ? adminUser.id : userId;
        
        // Internal notes are only created by admin and only sometimes
        const isInternal = commentUser === adminUser.id && Math.random() < 0.3;
        
        await prisma.ticketComment.create({
          data: {
            ticket_id: ticket.id,
            user_id: commentUser,
            content: ticketComments[Math.floor(Math.random() * ticketComments.length)],
            created_at: commentDate,
            updated_at: commentDate,
            is_internal: isInternal
          }
        });
        
        // Next comment is 1-24 hours later
        commentDate = new Date(commentDate);
        commentDate.setHours(commentDate.getHours() + Math.floor(Math.random() * 24) + 1);
        
        // Don't create comments after the ticket was resolved
        if (resolvedAt && commentDate > resolvedAt) break;
      }
      
      // Generate attachments for some tickets (40% chance)
      if (Math.random() < 0.4) {
        const attachmentCount = Math.floor(Math.random() * 3) + 1; // 1-3 attachments
        
        for (let j = 0; j < attachmentCount; j++) {
          const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
          const fileSize = Math.floor(Math.random() * (fileType.sizeRange[1] - fileType.sizeRange[0])) + fileType.sizeRange[0];
          
          // File name based on ticket and type
          const fileName = `ticket_${ticket.id.substring(0, 8)}_attachment_${j + 1}.${fileType.extension}`;
          
          // Random uploader (either client or admin)
          const uploaderId = Math.random() < 0.7 ? userId : adminUser.id;
          
          await prisma.ticketAttachment.create({
            data: {
              ticket_id: ticket.id,
              file_name: fileName,
              file_url: `https://storage.example.com/attachments/${fileName}`,
              file_type: fileType.type,
              file_size: fileSize,
              uploaded_by: uploaderId,
              created_at: new Date(ticketDate)
            }
          });
        }
      }
    }
  }
  
  console.log(`Created ${allTickets.length} tickets with comments and attachments`);
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