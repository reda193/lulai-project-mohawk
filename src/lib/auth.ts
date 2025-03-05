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
        signOut: '/'
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
                    // Add the missing required properties:
                    hasCompletedOnboarding: false, // Default value for new Google signups
                    subscription: {
                        planType: 'FREE' as PlanType,
                        status: 'ACTIVE' as SubStatus,
                        currentPeriodEnd: null,
                        cancelAtPeriodEnd: false
                    }
                    // Optional properties can remain undefined
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
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Missing credentials");
                    }
                    const existingUser = await db.user.findUnique({
                        where: { email: credentials.email },
                        include: {
                            onboarding: true,
                            subscription: {
                                include: {
                                    subscription_items: true
                                }
                            }
                        }
                    });
            
                    if (!existingUser) {
                        throw new Error("User not found");
                    }
            
                    if (!existingUser.password) {
                        throw new Error("Please use Google login");
                    }
            
                    const passwordMatch = await compare(credentials.password, existingUser.password);
            
                    if (!passwordMatch) {
                        throw new Error("Invalid password");
                    }
                    console.log(`User logged in: ${existingUser.email} (${existingUser.userId})`);
                    return {
                        id: existingUser.userId,
                        email: existingUser.email,
                        first_name: existingUser.first_name,
                        last_name: existingUser.last_name,
                        role: existingUser.role,
                        hasCompletedOnboarding: existingUser.onboarding?.completed || false,
                        discoverySource: existingUser.onboarding?.discovery_source,
                        switchingFrom: existingUser.onboarding?.switching_from,
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
                    } as User;
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
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