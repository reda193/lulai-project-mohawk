import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const debugSessions = await db.debugSession.findMany();
    return NextResponse.json({ debugSessions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching debug session:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
