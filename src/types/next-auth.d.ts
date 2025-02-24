import type { NextAuth as _NextAuth } from "next-auth"
import { PlanType, SubStatus } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string; // Add this field
    email: string; // Add this field
    first_name?: string | null; // Make this optional with ? to avoid conflicts
    last_name?: string | null;
    role: "ADMIN" | "MEMBER";
    hasCompletedOnboarding: boolean;
    discoverySource?: string | null;
    switchingFrom?: string | null;
    subscription: {
      planType: PlanType;
      status: SubStatus;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
    };
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    first_name?: string | null;
    last_name?: string | null;
    role: "ADMIN" | "MEMBER";
    hasCompletedOnboarding: boolean;
    discoverySource?: string | null;
    switchingFrom?: string | null;
    subscription: {
      planType: PlanType;
      status: SubStatus;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
    };
  }
}