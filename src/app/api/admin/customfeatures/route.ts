import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
    
        try {
            const customFeatures = await db.customFeature.findMany(); // Use prisma.customFeature
            return NextResponse.json({ customFeatures}, { status: 200 });
            
        } catch (error) {
            console.error('Error fetching custom features:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
            
        }
    
    }