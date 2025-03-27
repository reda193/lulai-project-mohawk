import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";



export async function GET(req: NextRequest) {
        try {
            const featureFlags = await db.featureFlag.findMany(); // Use prisma.featureFlag
            return NextResponse.json({ featureFlags}, { status: 200 });
            
        } catch (error) {
            console.error('Error fetching feature flags:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
}