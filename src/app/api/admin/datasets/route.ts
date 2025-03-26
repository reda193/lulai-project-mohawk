import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const datasets = await db.dataset.findMany();
    return NextResponse.json({ datasets }, { status: 200 });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}