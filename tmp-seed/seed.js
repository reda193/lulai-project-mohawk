"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var crypto_1 = require("crypto");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, users, adminUser, memberUser, freeUser, botModels, botNames, botDescriptions, categories, colorOptions, allBots, i, j, index, botIndex, bot, qaCount, k, trainingCount, k, now, ninetyDaysAgo, csatDistributions, conversationCountByType, _loop_1, _i, allBots_1, bot;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting seed process...');
                    // Clean up existing data in reverse order of dependencies
                    return [4 /*yield*/, prisma.csat.deleteMany({})];
                case 1:
                    // Clean up existing data in reverse order of dependencies
                    _a.sent();
                    return [4 /*yield*/, prisma.unrecognizedQueries.deleteMany({})];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.knowledge_Queries.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.conv_Messages.deleteMany({})];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.conversation.deleteMany({})];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.training_Coverage.deleteMany({})];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.bot_Training.deleteMany({})];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.bot_QA.deleteMany({})];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.bot_Appearance.deleteMany({})];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.bot.deleteMany({})];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, prisma.subscriptionItem.deleteMany({})];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, prisma.subscription.deleteMany({})];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, prisma.userOnboarding.deleteMany({})];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, prisma.session.deleteMany({})];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, prisma.account.deleteMany({})];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany({})];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)('Admintest123!', 10)];
                case 17:
                    hashedPassword = _a.sent();
                    users = [];
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                userId: (0, crypto_1.randomUUID)(),
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
                                        plan_type: client_1.PlanType.PRO,
                                        status: client_1.SubStatus.ACTIVE,
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
                        })];
                case 18:
                    adminUser = _a.sent();
                    users.push(adminUser);
                    console.log("Created admin user: ".concat(adminUser.email));
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                userId: (0, crypto_1.randomUUID)(),
                                email: 'test@example.com',
                                password: hashedPassword,
                                first_name: 'Test',
                                last_name: 'User',
                                verified: true,
                                role: client_1.Role.MEMBER,
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
                                        plan_type: client_1.PlanType.BASIC,
                                        status: client_1.SubStatus.ACTIVE,
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
                        })];
                case 19:
                    memberUser = _a.sent();
                    users.push(memberUser);
                    console.log("Created member user: ".concat(memberUser.email));
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                userId: (0, crypto_1.randomUUID)(),
                                email: 'free@example.com',
                                password: hashedPassword,
                                first_name: 'Free',
                                last_name: 'User',
                                verified: true,
                                role: client_1.Role.MEMBER,
                                lastLogin: new Date(),
                                onboarding: {
                                    create: {
                                        completed: false,
                                        discovery_source: 'Social Media',
                                    }
                                },
                                subscription: {
                                    create: {
                                        plan_type: client_1.PlanType.FREE,
                                        status: client_1.SubStatus.ACTIVE,
                                        current_period_start: new Date(),
                                        current_period_end: null, // Free plan doesn't expire
                                    }
                                }
                            }
                        })];
                case 20:
                    freeUser = _a.sent();
                    users.push(freeUser);
                    console.log("Created free user: ".concat(freeUser.email));
                    // Create a few social logins for the first user
                    return [4 /*yield*/, prisma.account.create({
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
                        })];
                case 21:
                    // Create a few social logins for the first user
                    _a.sent();
                    console.log("Created Google account for admin user");
                    // Create active session for admin
                    return [4 /*yield*/, prisma.session.create({
                            data: {
                                userId: adminUser.id,
                                sessionToken: (0, crypto_1.randomUUID)(),
                                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                            }
                        })];
                case 22:
                    // Create active session for admin
                    _a.sent();
                    console.log("Created session for admin user");
                    botModels = [
                        client_1.BotModel.GPT_3_5_TURBO,
                        client_1.BotModel.GPT_4,
                        client_1.BotModel.CLAUDE_3_SONNET,
                        client_1.BotModel.CLAUDE_3_HAIKU,
                        client_1.BotModel.CLAUDE_3_OPUS,
                        client_1.BotModel.GEMINI_PRO
                    ];
                    botNames = [
                        'Customer Support Bot',
                        'Sales Assistant',
                        'Technical Help Bot',
                        'Product Recommender',
                        'IT Assistant',
                        'Marketing Helper'
                    ];
                    botDescriptions = [
                        'A bot that helps with customer inquiries and support tickets',
                        'An assistant to help with sales processes and lead qualification',
                        'A bot that provides technical assistance and troubleshooting',
                        'A smart bot that recommends products based on customer needs',
                        'An assistant that helps with IT-related questions and issues',
                        'A helper for marketing tasks and campaign ideas'
                    ];
                    categories = [
                        'Support',
                        'Sales',
                        'Technical',
                        'Product',
                        'IT',
                        'Marketing'
                    ];
                    colorOptions = [
                        '#4F46E5', // Indigo
                        '#DC2626', // Red
                        '#059669', // Green
                        '#D97706', // Amber
                        '#7C3AED', // Purple
                        '#2563EB' // Blue
                    ];
                    allBots = [];
                    i = 0;
                    _a.label = 23;
                case 23:
                    if (!(i < users.length)) return [3 /*break*/, 37];
                    j = 0;
                    _a.label = 24;
                case 24:
                    if (!(j < 2)) return [3 /*break*/, 36];
                    index = i * 2 + j;
                    botIndex = index % botNames.length;
                    return [4 /*yield*/, prisma.bot.create({
                            data: {
                                bot_name: "".concat(users[i].first_name, "'s ").concat(botNames[botIndex]),
                                description: botDescriptions[botIndex],
                                purpose: "To provide ".concat(botNames[botIndex].toLowerCase(), " assistance"),
                                company_size: ['Small', 'Medium', 'Enterprise'][Math.floor(Math.random() * 3)],
                                company_type: ['B2B', 'B2C', 'Both'][Math.floor(Math.random() * 3)],
                                use_case_category: categories[botIndex],
                                use_case_description: "This bot is designed to help with ".concat(categories[botIndex].toLowerCase(), " tasks"),
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
                        })];
                case 25:
                    bot = _a.sent();
                    allBots.push(bot);
                    console.log("Created bot: ".concat(bot.bot_name, " for user ").concat(users[i].email));
                    qaCount = Math.floor(Math.random() * 5) + 5;
                    k = 0;
                    _a.label = 26;
                case 26:
                    if (!(k < qaCount)) return [3 /*break*/, 29];
                    return [4 /*yield*/, prisma.bot_QA.create({
                            data: {
                                bot_id: bot.id,
                                question: "Common question ".concat(k + 1, " about ").concat(categories[botIndex], "?"),
                                answer: "Detailed answer to question ".concat(k + 1, " about ").concat(categories[botIndex], "."),
                                category: categories[botIndex],
                                is_active: Math.random() > 0.1 // 90% active
                            }
                        })];
                case 27:
                    _a.sent();
                    _a.label = 28;
                case 28:
                    k++;
                    return [3 /*break*/, 26];
                case 29:
                    trainingCount = Math.floor(Math.random() * 3) + 2;
                    k = 0;
                    _a.label = 30;
                case 30:
                    if (!(k < trainingCount)) return [3 /*break*/, 33];
                    return [4 /*yield*/, prisma.bot_Training.create({
                            data: {
                                bot_id: bot.id,
                                prompt_type: ['Base Knowledge', 'Persona', 'Tone', 'Specific Response'][Math.floor(Math.random() * 4)],
                                prompt_content: "Training content for ".concat(categories[botIndex], " bot"),
                                category: categories[botIndex],
                                context: "Context for training entry ".concat(k + 1)
                            }
                        })];
                case 31:
                    _a.sent();
                    _a.label = 32;
                case 32:
                    k++;
                    return [3 /*break*/, 30];
                case 33: 
                // Create training coverage metrics
                return [4 /*yield*/, prisma.training_Coverage.create({
                        data: {
                            bot_id: bot.id,
                            total_unique_queries: Math.floor(Math.random() * 500) + 100,
                            covered_intents: Math.floor(Math.random() * 40) + 10
                        }
                    })];
                case 34:
                    // Create training coverage metrics
                    _a.sent();
                    _a.label = 35;
                case 35:
                    j++;
                    return [3 /*break*/, 24];
                case 36:
                    i++;
                    return [3 /*break*/, 23];
                case 37:
                    now = new Date();
                    ninetyDaysAgo = new Date(now);
                    ninetyDaysAgo.setDate(now.getDate() - 90);
                    csatDistributions = [
                        [5, 10, 15, 30, 40], // Customer Support Bot
                        [3, 7, 20, 35, 35], // Sales Assistant 
                        [2, 5, 13, 35, 45], // Technical Help Bot
                        [4, 6, 20, 30, 40], // Product Recommender
                        [1, 4, 15, 40, 40], // IT Assistant
                        [2, 8, 12, 38, 40] // Marketing Helper
                    ];
                    conversationCountByType = {
                        'Customer Support Bot': 120,
                        'Sales Assistant': 90,
                        'Technical Help Bot': 150,
                        'Product Recommender': 80,
                        'IT Assistant': 110,
                        'Marketing Helper': 70
                    };
                    _loop_1 = function (bot) {
                        var botTypeParts, botType, baseType, baseCount, varianceFactor, conversationCount, botTypeIndex, distribution, i, randomDaysAgo, conversationDate, durationMinutes, endTime, sentimentScore, conversation, messageCount, messageStartTime, lastBotMessage, j, isBot, messageTime, usedKnowledgeBase, message, queryCount, k, rating, rand, cumulativeProb, r, feedbackTime;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    botTypeParts = bot.bot_name.split("'s ");
                                    botType = botTypeParts.length > 1 ? botTypeParts[1] : botTypeParts[0];
                                    baseType = Object.keys(conversationCountByType).find(function (type) { return botType.includes(type); }) || 'Customer Support Bot';
                                    baseCount = conversationCountByType[baseType] || 100;
                                    varianceFactor = 0.7 + Math.random() * 0.6;
                                    conversationCount = Math.floor(baseCount * varianceFactor);
                                    botTypeIndex = Object.keys(conversationCountByType).indexOf(baseType);
                                    distribution = csatDistributions[botTypeIndex >= 0 ? botTypeIndex : 0];
                                    console.log("Generating ".concat(conversationCount, " conversations for ").concat(bot.bot_name, "..."));
                                    i = 0;
                                    _b.label = 1;
                                case 1:
                                    if (!(i < conversationCount)) return [3 /*break*/, 15];
                                    randomDaysAgo = Math.floor(Math.random() * 90);
                                    conversationDate = new Date(now);
                                    conversationDate.setDate(now.getDate() - randomDaysAgo);
                                    durationMinutes = Math.floor(Math.random() * 20) + 1;
                                    endTime = new Date(conversationDate);
                                    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
                                    sentimentScore = (Math.random() * 2 - 1).toFixed(2);
                                    return [4 /*yield*/, prisma.conversation.create({
                                            data: {
                                                bot_id: bot.id,
                                                start_time: conversationDate,
                                                end_time: endTime,
                                                escalated: Math.random() < 0.15, // 15% escalation rate
                                                resolution_status: Math.random() < 0.9 ? 'RESOLVED' : 'UNRESOLVED',
                                                minutes: durationMinutes,
                                                sentiment_score: parseFloat(sentimentScore)
                                            }
                                        })];
                                case 2:
                                    conversation = _b.sent();
                                    messageCount = Math.floor(Math.random() * 8) + 3;
                                    messageStartTime = new Date(conversationDate);
                                    lastBotMessage = null;
                                    j = 0;
                                    _b.label = 3;
                                case 3:
                                    if (!(j < messageCount)) return [3 /*break*/, 12];
                                    isBot = j % 2 === 1;
                                    messageTime = new Date(messageStartTime);
                                    messageTime.setMinutes(messageTime.getMinutes() + Math.floor(j * durationMinutes / messageCount));
                                    usedKnowledgeBase = isBot && Math.random() < 0.4;
                                    return [4 /*yield*/, prisma.conv_Messages.create({
                                            data: {
                                                conversation_id: conversation.id,
                                                sender_type: isBot ? 'BOT' : 'USER',
                                                message_text: isBot
                                                    ? "Bot response ".concat(j / 2 + 1, " for ").concat(bot.bot_name)
                                                    : "User message ".concat(Math.floor(j / 2) + 1, " about ").concat(baseType.toLowerCase()),
                                                sent_at: messageTime,
                                                response_time: isBot ? Math.floor(Math.random() * 5000) + 500 : null,
                                                used_knowledge_base: usedKnowledgeBase
                                            }
                                        })];
                                case 4:
                                    message = _b.sent();
                                    if (!isBot) return [3 /*break*/, 9];
                                    lastBotMessage = message;
                                    if (!usedKnowledgeBase) return [3 /*break*/, 8];
                                    queryCount = Math.floor(Math.random() * 2) + 1;
                                    k = 0;
                                    _b.label = 5;
                                case 5:
                                    if (!(k < queryCount)) return [3 /*break*/, 8];
                                    return [4 /*yield*/, prisma.knowledge_Queries.create({
                                            data: {
                                                message_id: message.id,
                                                query_text: "Knowledge query ".concat(k + 1, " for ").concat(baseType.toLowerCase()),
                                                was_successful: Math.random() < 0.85, // 85% success rate
                                                response_score: Math.random() * 0.5 + 0.5, // 0.5 to 1.0
                                                confidence_score: Math.random() * 0.4 + 0.6 // 0.6 to 1.0
                                            }
                                        })];
                                case 6:
                                    _b.sent();
                                    _b.label = 7;
                                case 7:
                                    k++;
                                    return [3 /*break*/, 5];
                                case 8: return [3 /*break*/, 11];
                                case 9:
                                    if (!(Math.random() < 0.15)) return [3 /*break*/, 11];
                                    return [4 /*yield*/, prisma.unrecognizedQueries.create({
                                            data: {
                                                message_id: message.id,
                                                query_text: "Unrecognized question about ".concat(baseType.toLowerCase()),
                                                frequency: Math.floor(Math.random() * 3) + 1, // 1-3 frequency
                                                first_seen_at: new Date(messageTime),
                                                last_seen_at: new Date(messageTime)
                                            }
                                        })];
                                case 10:
                                    _b.sent();
                                    _b.label = 11;
                                case 11:
                                    j++;
                                    return [3 /*break*/, 3];
                                case 12:
                                    if (!(Math.random() < 0.8)) return [3 /*break*/, 14];
                                    rating = 0;
                                    rand = Math.random() * 100;
                                    cumulativeProb = 0;
                                    for (r = 0; r < distribution.length; r++) {
                                        cumulativeProb += distribution[r];
                                        if (rand <= cumulativeProb) {
                                            rating = r + 1; // Ratings are 1-5
                                            break;
                                        }
                                    }
                                    if (rating === 0)
                                        rating = 5; // Fallback
                                    feedbackTime = new Date(endTime);
                                    feedbackTime.setMinutes(feedbackTime.getMinutes() + Math.floor(Math.random() * 10) + 1);
                                    return [4 /*yield*/, prisma.csat.create({
                                            data: {
                                                conversation_id: conversation.id,
                                                rating_score: rating,
                                                feedback_at: feedbackTime,
                                                submitted_at: feedbackTime
                                            }
                                        })];
                                case 13:
                                    _b.sent();
                                    _b.label = 14;
                                case 14:
                                    i++;
                                    return [3 /*break*/, 1];
                                case 15: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allBots_1 = allBots;
                    _a.label = 38;
                case 38:
                    if (!(_i < allBots_1.length)) return [3 /*break*/, 41];
                    bot = allBots_1[_i];
                    return [5 /*yield**/, _loop_1(bot)];
                case 39:
                    _a.sent();
                    _a.label = 40;
                case 40:
                    _i++;
                    return [3 /*break*/, 38];
                case 41:
                    console.log('Seed completed successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var prisma2 = new client_1.PrismaClient();
function main2() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Seed Feature Flags
                return [4 /*yield*/, prisma.featureFlag.createMany({
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
                    })];
                case 1:
                    // Seed Feature Flags
                    _a.sent();
                    // Seed Custom Features
                    return [4 /*yield*/, prisma.customFeature.createMany({
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
                        })];
                case 2:
                    // Seed Custom Features
                    _a.sent();
                    console.log('Mock data seeded successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main2()
    .catch(function (e) {
    console.error('Error seeding mock data:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
function main3() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Seed invoices
                return [4 /*yield*/, prisma.invoice.createMany({
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
                    })];
                case 1:
                    // Seed invoices
                    _a.sent();
                    // Seed subscriptions
                    return [4 /*yield*/, prisma.subscription.createMany({
                            data: [
                                {
                                    userId: 1, // Must match an existing user ID
                                    plan_type: 'PRO', // Must be a valid PlanType (e.g., 'FREE', 'PRO', 'ENTERPRISE')
                                    status: 'ACTIVE', // Must be a valid SubStatus (e.g., 'ACTIVE', 'TRIAL', 'CANCELED')
                                    current_period_start: new Date('2023-09-01'),
                                    current_period_end: new Date('2023-10-01'),
                                    cancel_at_period_end: false,
                                },
                                {
                                    userId: 2, // Must match an existing user ID
                                    plan_type: 'BASIC',
                                    status: client_1.SubStatus.TRIALING,
                                    current_period_start: new Date('2023-10-01'),
                                    current_period_end: new Date('2023-11-01'),
                                    cancel_at_period_end: false,
                                },
                                {
                                    userId: 3, // Must match an existing user ID
                                    plan_type: client_1.PlanType.PRO, // Replace with a valid PlanType value
                                    status: 'CANCELED',
                                    current_period_start: new Date('2023-08-01'),
                                    current_period_end: new Date('2023-09-30'),
                                    cancel_at_period_end: true,
                                },
                            ],
                        })];
                case 2:
                    // Seed subscriptions
                    _a.sent();
                    // Seed payments
                    return [4 /*yield*/, prisma.payment.createMany({
                            data: [
                                {
                                    clientId: '1',
                                    invoiceId: '1', // Make sure this matches an existing invoice ID
                                    amount: 100,
                                    date: new Date('2023-10-01'),
                                    method: 'credit_card',
                                },
                                {
                                    clientId: '2',
                                    invoiceId: '2', // Make sure this matches an existing invoice ID
                                    amount: 50,
                                    date: new Date('2023-10-05'),
                                    method: 'paypal',
                                },
                            ],
                        })];
                case 3:
                    // Seed payments
                    _a.sent();
                    console.log('Mock data seeded successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main3()
    .catch(function (e) {
    console.error('Error seeding mock data:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
