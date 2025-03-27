import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const apiKeys = await db.apiKey.findMany();
    return NextResponse.json({ apiKeys }, { status: 200 });
  } catch (error) {
    console.error('Error fetching apiKeys:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}