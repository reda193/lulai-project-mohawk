import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { compare } from "bcryptjs";
import type { User } from "next-auth";
import { PlanType, SubStatus } from "@prisma/client";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login',
        signOut: '/',
        error: '/login' // Add this to handle error display
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    id: profile.sub,
                    email: profile.email,
                    first_name: profile.given_name,
                    last_name: profile.family_name,
                    emailVerified: new Date().toISOString(),
                    role: "MEMBER",
                    // Add default values for onboarding
                    hasCompletedOnboarding: false,
                    discoverySource: null,
                    switchingFrom: null,
                    subscription: {
                        planType: 'FREE' as PlanType,
                        status: 'ACTIVE' as SubStatus,
                        currentPeriodEnd: null,
                        cancelAtPeriodEnd: false
                    }
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "john@mail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<User | null> {
                try {
                    console.log("Database URL:", process.env.DATABASE_URL);
                    
                    if (!credentials?.email || !credentials?.password) {
                        console.error("Missing credentials");
                        throw new Error("Please enter your email and password");
                    }
                    
                    // Find user with case-insensitive email search
                    const users = await db.user.findMany({
                        where: {
                            email: {
                                contains: credentials.email,
                                mode: 'insensitive'
                            }
                        },
                        include: {
                            onboarding: true,
                            subscription: true
                        }
                    });
                    
                    console.log(`Found ${users.length} users with similar email`);
                    
                    // Use the first matching user or null if none found
                    const existingUser = users.length > 0 ? users[0] : null;
            
                    if (!existingUser) {
                        console.error("User not found with email:", credentials.email);
                        throw new Error("No account found with this email");
                    }
            
                    if (!existingUser.password) {
                        console.error("User has no password (likely Google login):", existingUser.email);
                        throw new Error("Please use Google login for this account");
                    }
            
                    const passwordMatch = await compare(credentials.password, existingUser.password);
                    console.log("Password match result:", passwordMatch);
            
                    if (!passwordMatch) {
                        console.error("Invalid password for user:", existingUser.email);
                        throw new Error("Invalid email or password");
                    }
            
                    console.log(`User logged in successfully: ${existingUser.email}`);
                    
                    return {
                        id: existingUser.userId,
                        email: existingUser.email,
                        first_name: existingUser.first_name,
                        last_name: existingUser.last_name,
                        role: existingUser.role || "MEMBER",
                        hasCompletedOnboarding: existingUser.onboarding?.completed || false,
                        discoverySource: existingUser.onboarding?.discovery_source || null,
                        switchingFrom: existingUser.onboarding?.switching_from || null,
                        subscription: existingUser.subscription ? {
                            planType: existingUser.subscription.plan_type,
                            status: existingUser.subscription.status,
                            currentPeriodEnd: existingUser.subscription.current_period_end,
                            cancelAtPeriodEnd: existingUser.subscription.cancel_at_period_end
                        } : {
                            planType: 'FREE' as PlanType,
                            status: 'ACTIVE' as SubStatus,
                            currentPeriodEnd: null,
                            cancelAtPeriodEnd: false
                        }
                    };
                } catch (error) {
                    // Rethrow the error with the message so it gets passed to the client
                    if (error instanceof Error) {
                        throw new Error(error.message);
                    }
                    throw new Error("An unexpected error occurred");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Transfer ALL user properties to token
                token.first_name = user.first_name;
                token.last_name = user.last_name;
                token.role = user.role;
                token.hasCompletedOnboarding = user.hasCompletedOnboarding;
                token.discoverySource = user.discoverySource;
                token.switchingFrom = user.switchingFrom;
                token.subscription = user.subscription;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Transfer ALL token properties to session
                session.user.first_name = token.first_name;
                session.user.last_name = token.last_name;
                session.user.role = token.role;
                session.user.hasCompletedOnboarding = token.hasCompletedOnboarding;
                session.user.discoverySource = token.discoverySource;
                session.user.switchingFrom = token.switchingFrom;
                session.user.subscription = token.subscription;
            }
            return session;
        },
    }
}