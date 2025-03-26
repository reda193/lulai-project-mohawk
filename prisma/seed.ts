import { PrismaClient, BotModel, Role, PlanType, SubStatus } from '@prisma/client';
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

  const prisma2 = new PrismaClient();

async function main2() {
  // Seed Feature Flags
  await prisma.featureFlag.createMany({
    data: [
      {
        
        featureName: 'Sample Feature Flag 1',
        description: 'This is the first sample feature flag.',
        enabledFor: ['all'],
        isActive: true,
      },
      {
       
        featureName: 'Sample Feature Flag 2',
        description: 'This is the second sample feature flag.',
        enabledFor: ['client1', 'client2'],
        isActive: false,
      },
    ],
  });

  // Seed Custom Features
  await prisma.customFeature.createMany({
    data: [
      {
        
        clientId: 'client1',
        featureName: 'Sample Custom Feature 1',
        description: 'This is the first sample custom feature.',
        status: 'DRAFT',
      },
      {
       
        clientId: 'client2',
        featureName: 'Sample Custom Feature 2',
        description: 'This is the second sample custom feature.',
        status: 'TESTING',
        sandboxUrl: 'https://sandbox.example.com/2',
      },
    ],
  });

  console.log('Mock data seeded successfully!');
}

main2()
  .catch((e) => {
    console.error('Error seeding mock data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  async function main3() {
    // Seed invoices
    // First create users if they don't exist
  const users = await prisma.user.findMany();
  if (users.length < 3) {
    await prisma.user.createMany({
      data: [
        { id: 1, email: 'client1@example.com', /* other required fields */ },
        { id: 2, email: 'client2@example.com', /* other required fields */ },
        { id: 3, email: 'client3@example.com', /* other required fields */ }
      ]
    });
  }

  const invoices = await prisma.invoice.createMany({
    data: [
      {
        clientId: '1',
        amount: 100,
        status: 'paid',
        dueDate: new Date('2023-10-01'),
      },
      {
        clientId: '2',
        amount: 50,
        status: 'failed',
        dueDate: new Date('2023-10-05'),
        attempts: 2,
      },
      {
        clientId: '3',
        amount: 200,
        status: 'pending',
        dueDate: new Date('2023-10-10'),
      },
    ],
    });
  
    await prisma.subscription.createMany({
      skipDuplicates: true, // Skip if subscription already exists
      data: [
        {
          userId: 1, // Unique user
          plan_type: 'PRO',
          status: 'ACTIVE',
          current_period_start: new Date('2023-09-01'),
          current_period_end: new Date('2023-10-01'),
          cancel_at_period_end: false,
        },
        {
          userId: 2, // Unique user
          plan_type: 'BASIC',
          status: 'TRIALING',
          current_period_start: new Date('2023-10-01'),
          current_period_end: new Date('2023-11-01'),
          cancel_at_period_end: false,
        },
        {
          userId: 3, // Unique user
          plan_type: 'PRO',
          status: 'CANCELED',
          current_period_start: new Date('2023-08-01'),
          current_period_end: new Date('2023-09-30'),
          cancel_at_period_end: true,
        },
      ],
    });
  
    // Seed payments
    const createdInvoices = await prisma.invoice.findMany();
  
  // Now create payments with the correct invoice IDs
  await prisma.payment.createMany({
    data: [
      {
        clientId: '1',
        invoiceId: createdInvoices[0].id, // Use actual invoice ID
        amount: 100,
        date: new Date('2023-10-01'),
        method: 'credit_card',
      },
      {
        clientId: '2',
        invoiceId: createdInvoices[1].id, // Use actual invoice ID
        amount: 50,
        date: new Date('2023-10-05'),
        method: 'paypal',
      },
    ],
    });
  
    console.log('Mock data seeded successfully!');
  }
  
  main3()
    .catch((e) => {
      console.error('Error seeding mock data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
   
    
    async function main4() {
        // Seed tickets
       
    
      const tickets = await prisma.ticket.createMany({
        data: [
          {
          
          clientName: 'Client A',
          issue: 'Chatbot not responding',
          status: 'open',
          createdAt: '2023-10-01T10:00:00Z',
          responseTime: 2,
        },
        {
          
          clientName: 'Client B',
          issue: 'Incorrect responses from chatbot',
          status: 'in_progress',
          assignedTo: 'John Doe',
          createdAt: '2023-10-02T12:00:00Z',
          updatedAt: '2023-10-02T14:00:00Z',
          responseTime: 1.5,
        },
        {
          
          clientName: 'Client C',
          issue: 'Integration failure with Shopify',
          status: 'resolved',
          assignedTo: 'Jane Smith',
          createdAt: '2023-10-03T09:00:00Z',
          updatedAt: '2023-10-03T11:00:00Z',
          responseTime: 3,
        },
        ],
        });
      
        await prisma.debugSession.createMany({
          skipDuplicates: true, // Skip 
          data: [
            {
          
          clientName: 'Client A',
          chatbotId: 'chatbot_123',
          startedAt: '2023-10-01T10:00:00Z',
          status: 'ended',
          messages: [
            {
              
              sender: 'user',
              text: 'Hello, my chatbot is not working.',
              timestamp: '2023-10-01T10:05:00Z',
            },
            {
              
              sender: 'bot',
              text: 'Hi! How can I assist you today?',
              timestamp: '2023-10-01T10:06:00Z',
            },
          ],
        },
          ],
        });
      
            console.log('Mock data seeded successfully!');
      }
      
      main4()
        .catch((e) => {
          console.error('Error seeding mock data:', e);
          process.exit(1);
        })
        .finally(async () => {
          await prisma.$disconnect();
        });
        
        async function main5() {
   
          const logs = await prisma.log.createMany({
            data: [
              {
              
              userId: 'user1',
              username: 'john_doe',
              ipAddress: '192.168.1.1',
              timestamp: '2023-10-01T12:34:56Z',
              activity: 'login',
              location: 'New York, USA',
              isSuspicious: false,
            },
            {
              
              userId: 'user2',
              username: 'jane_smith',
              ipAddress: '203.0.113.45',
              timestamp: '2023-10-02T14:22:10Z',
              activity: 'failed_login',
              location: 'London, UK',
              isSuspicious: true,
            },
            {
              
              userId: 'user3',
              username: 'alice_wonder',
              ipAddress: '198.51.100.23',
              timestamp: '2023-10-03T09:15:30Z',
              activity: 'logout',
              isSuspicious: false,
            },
        
            ],
            });
          
            const requests = await prisma.request.createMany({
            data: [
              {
              
              userId: 'user1',
              username: 'john_doe',
              requestType: 'data_access',
              status: 'pending',
              requestedAt: '2023-10-01T10:00:00Z',
            },
            {
              
              userId: 'user2',
              username: 'jane_smith',
              requestType: 'data_deletion',
              status: 'completed',
              requestedAt: '2023-10-02T11:30:00Z',
              completedAt: '2023-10-02T12:00:00Z',
            },
            {
              
              userId: 'user3',
              username: 'alice_wonder',
              requestType: 'data_access',
              status: 'rejected',
              requestedAt: '2023-10-03T09:00:00Z',
            },
        
            ],
            });
        
                console.log('Mock data seeded successfully!');
          }
          
          main5()
            .catch((e) => {
              console.error('Error seeding mock data:', e);
              process.exit(1);
            })
            .finally(async () => {
              await prisma.$disconnect();
            });
          
            async function main6() {
   

              const configs = await prisma.config.createMany({
                data: [
                  {
                  
                  clientName: 'Client A',
                  defaultBehavior: {
                    responseDelay: 2,
                    tone: 'friendly',
                    language: 'en',
                  },
                  branding: {
                    primaryColor: '#3b82f6',
                    secondaryColor: '#10b981',
                  },
                },
                {
                  
                  clientName: 'Client B',
                  defaultBehavior: {
                    responseDelay: 5,
                    tone: 'formal',
                    language: 'es',
                  },
                  branding: {
                    primaryColor: '#ef4444',
                    secondaryColor: '#f59e0b',
                  },
                },
            
            
                ],
                });
              
                const overrides = await prisma.override.createMany({
                data: [
                  {
                  
                  action: 'restart',
                  target: 'all',
                  status: 'completed',
                  initiatedAt: '2023-10-01T10:00:00Z',
                  completedAt: '2023-10-01T10:02:00Z',
                },
                {
                  
                  action: 'disable',
                  target: 'specific',
                  clientIds: ['client1', 'client2'],
                  status: 'pending',
                  initiatedAt: '2023-10-02T12:00:00Z',
                },
            
            
                ],
                });
            
                    console.log('Mock data seeded successfully!');
              }
              
              main6()
                .catch((e) => {
                  console.error('Error seeding mock data:', e);
                  process.exit(1);
                })
                .finally(async () => {
                  await prisma.$disconnect();
                });
              
                async function main7() {
   

                  const clients = await prisma.client.createMany({
                    data: [
                      {
                      
                      name: 'TechCorp Solutions',
                      industry: 'Technology',
                      size: 'Large (500-1000)',
                      subscriptionPlan: 'Enterprise',
                      status: 'Active',
                      contactEmail: 'admin@techcorp.com',
                      contactPhone: '(555) 123-4567',
                      contactPerson: 'John Smith',
                      apiUsage: '85%',
                      lastActive:  new Date('2024-03-05'),
                    },
                    {
                      
                      name: 'HealthCare Innovations',
                      industry: 'Healthcare',
                      size: 'Medium (100-500)',
                      subscriptionPlan: 'Professional',
                      status: 'Active',
                      contactEmail: 'support@healthcare.com',
                      contactPhone: '(555) 987-6543',
                      contactPerson: 'Emily Rodriguez',
                      apiUsage: '62%',
                      lastActive: new Date('2024-03-04'),
                    },
                    {
                      
                      name: 'FinServe Global',
                      industry: 'Finance',
                      size: 'Small (10-100)',
                      subscriptionPlan: 'Basic',
                      status: 'Suspended',
                      contactEmail: 'info@finserve.com',
                      contactPhone: '(555) 456-7890',
                      contactPerson: 'Robert Taylor',
                      apiUsage: '0%',
                      lastActive: new Date('2024-02-20'),
                    }
                    ],
                    });
                  
                    
                        console.log('Mock data seeded successfully!');
                  }
                  
                  main7()
                    .catch((e) => {
                      console.error('Error seeding mock data:', e);
                      process.exit(1);
                    })
                    .finally(async () => {
                      await prisma.$disconnect();
                    });

                    async function main8() {
   

                      const models = await prisma.model.createMany({
                        data: [
                          {
                          
                          name: 'GPT-4',
                          provider: 'OpenAI',
                          version: '4.0',
                          type: 'Text Generation',
                          status: 'active',
                          lastUpdated: new Date('2023-10-01'),
                        },
                        {
                          
                          name: 'BERT',
                          provider: 'Google',
                          version: '1.0',
                          type: 'Text Classification',
                          status: 'inactive',
                          lastUpdated: new Date('2023-09-15'),
                        },
                        {
                          
                          name: 'DALL-E',
                          provider: 'OpenAI',
                          version: '2.0',
                          type: 'Image Generation',
                          status: 'deprecated',
                          lastUpdated: new Date('2023-08-01'),
                        },
                    
                    
                    
                        ],
                        });
                      
                        const datasets = await prisma.dataset.createMany({
                        data: [
                          {
                          
                          clientId: '1',
                          clientName: 'Client A',
                          name: 'Customer Support Dataset',
                          status: 'pending_review',
                          fileCount: 10,
                          totalSize: '1.2 GB',
                          submittedAt: '2023-10-01T09:00:00Z',
                          description: 'Dataset containing customer support interactions for training.',
                        },
                        {
                          
                          clientId: '2',
                          clientName: 'Client B',
                          name: 'Product Reviews Dataset',
                          status: 'approved',
                          fileCount: 5,
                          totalSize: '500 MB',
                          submittedAt: '2023-09-28T11:00:00Z',
                          description: 'Dataset containing product reviews for sentiment analysis.',
                        },
                    
                    
                    
                        ],
                        });
                     const statistics = await prisma.statistic.createMany({
                        data: [
                          {
                          date: new Date('2023-10-01'),
                          totalInteractions: 1200,
                          uniqueUsers: 300,
                          avgResponseTime: 1.2,
                          errorRate: 0.5,
                        },
                        {
                          date: new Date('2023-10-02'),
                          totalInteractions: 1500,
                          uniqueUsers: 400,
                          avgResponseTime: 1.1,
                          errorRate: 0.4,
                        },
                        {
                          date: new Date('2023-10-03'),
                          totalInteractions: 1800,
                          uniqueUsers: 500,
                          avgResponseTime: 1.3,
                          errorRate: 0.6,
                        },
                    
                    
                    
                    
                        ],
                        });
                     const errors = await prisma.error.createMany({
                        data: [
                          {
                          
                          clientId: '1',
                          clientName: 'Client A',
                          timestamp: '2023-10-01T12:00:00Z',
                          errorType: 'Timeout',
                          errorMessage: 'Request timed out after 10 seconds.',
                          modelId: '1',
                          modelName: 'GPT-4',
                          severity: 'high',
                          status: 'new',
                        },
                        {
                         
                          clientId: '2',
                          clientName: 'Client B',
                          timestamp: '2023-10-02T14:00:00Z',
                          errorType: 'Authentication Failure',
                          errorMessage: 'Invalid API key provided.',
                          modelId: '2',
                          modelName: 'BERT',
                          severity: 'critical',
                          status: 'investigating',
                        },
                    
                    
                    
                    
                    
                        ],
                        });
                    
                            console.log('Mock data seeded successfully!');
                      }
                    
                      
                      main8()
                        .catch((e) => {
                          console.error('Error seeding mock data:', e);
                          process.exit(1);
                        })
                        .finally(async () => {
                          await prisma.$disconnect();
                        });

                        async function main9() {
   

                          const apiKeys = await prisma.apiKey.createMany({
                            data: [
                              {
                            
                              clientName: 'Client A',
                              apiKey: 'api_1234567890abcdef',
                              createdAt: '2023-10-01T10:00:00Z',
                              status: 'active',
                              usageLimit: 1000,
                              usageCount: 450,
                            },
                            {
                             
                              clientName: 'Client B',
                              apiKey: 'api_0987654321fedcba',
                              createdAt: '2023-10-02T12:00:00Z',
                              status: 'revoked',
                              usageLimit: 500,
                              usageCount: 500,
                            },
                        
                            ],
                            });
                          
                            const integrations = await prisma.integration.createMany({
                            data: [
                              {
                              
                              platform: 'whatsapp',
                              clientName: 'Client A',
                              status: 'connected',
                              lastChecked: '2023-10-01T10:00:00Z',
                            },
                            {
                             
                              platform: 'shopify',
                              clientName: 'Client B',
                              status: 'error',
                              lastChecked: '2023-10-02T12:00:00Z',
                              errorMessage: 'Authentication failed',
                            },
                            {
                            
                              platform: 'instagram',
                              clientName: 'Client C',
                              status: 'disconnected',
                              lastChecked: '2023-10-03T14:00:00Z',
                            },
                        
                            ],
                            });
                        
                                console.log('Mock data seeded successfully!');
                          }
                        
                          
                          main9()
                            .catch((e) => {
                              console.error('Error seeding mock data:', e);
                              process.exit(1);
                            })
                            .finally(async () => {
                              await prisma.$disconnect();
                            });
                        
                    