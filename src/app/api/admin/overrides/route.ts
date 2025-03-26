import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const overrides = await db.override.findMany();
    return NextResponse.json({ overrides }, { status: 200 });
  } catch (error) {
    console.error('Error fetching overrides:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}