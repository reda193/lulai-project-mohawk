import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const statistics = await db.statistic.findMany();
    return NextResponse.json({ statistics }, { status: 200 });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}