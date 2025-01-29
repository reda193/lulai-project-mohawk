import type { NextAuth as _NextAuth } from "next-auth"

declare module "next-auth" {
  interface User {
    first_name: string
    role: string
  }

  interface Session {
    user: User & {
      first_name: string
      role: string
    }
    token: {
      first_name: string
      role: string
    }
  }
}