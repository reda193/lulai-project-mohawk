import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const configs = await db.config.findMany();
    return NextResponse.json({ configs }, { status: 200 });
  } catch (error) {
    console.error('Error fetching configs:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}