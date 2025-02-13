import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import { compare } from "bcryptjs";
import type { User } from "next-auth";

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
                    console.log("Database URL:", process.env.DATABASE_URL); // Check which database you're connecting to
                    const user = await db.user.findUnique({
                        where: { email: "mohamed.reda33@outlook.com" }
                      });
                      console.log(user);
                    // Log incoming credentials (remove in production)
                    console.log("Authorize attempt with credentials:", {
                        email: credentials?.email,
                        hasPassword: !!credentials?.password
                    });
            
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Missing credentials");
                    }
            
                    const existingUser = await db.user.findUnique({
                        where: { email: credentials.email }
                    });
            
                    // Log user found status (remove in production)
                    console.log("User lookup result:", {
                        userFound: !!existingUser,
                        hasPassword: !!existingUser?.password
                    });
            
                    if (!existingUser) {
                        throw new Error("User not found");
                    }
            
                    if (!existingUser.password) {
                        throw new Error("Please use Google login");
                    }
            
                    const passwordMatch = await compare(credentials.password, existingUser.password);
            
                    // Log password match result (remove in production)
                    console.log("Password match result:", passwordMatch);
            
                    if (!passwordMatch) {
                        throw new Error("Invalid password");
                    }
            
                    return {
                        id: existingUser.userId,
                        email: existingUser.email,
                        first_name: existingUser.first_name || null,
                        role: existingUser.role || "MEMBER", 
                    } as User;
                } catch (error) {
                    // Log any errors that occur
                    console.error("Auth error:", error);
                    // Re-throw the error to be handled by NextAuth
                    throw error;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.first_name = user.first_name;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.first_name = token.first_name as string;
                session.user.role = token.role as string;
            }
            return session;
        },

    }
}