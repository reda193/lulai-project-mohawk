import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Verify server-side session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const {
      discovery_source,
      switching_from,
      planType
    } = body;

    // Find the user
    const user = await db.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update or create onboarding record
    const onboardingRecord = await db.userOnboarding.upsert({
      where: { userId: user.id },
      update: {
        discovery_source: discovery_source || undefined,
        switching_from: switching_from || undefined,
        completed: true,
        completed_at: new Date(),
        updated_at: new Date()
      },
      create: {
        userId: user.id,
        discovery_source: discovery_source || '',
        switching_from: switching_from || '',
        completed: true,
        completed_at: new Date()
      }
    });

    // Update or create subscription if planType is provided
    if (planType) {
      await db.subscription.upsert({
        where: { userId: user.id },
        update: {
          plan_type: planType,
          status: 'ACTIVE'
        },
        create: {
          userId: user.id,
          plan_type: planType,
          status: 'ACTIVE'
        }
      });
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      completed: true
    }, { status: 200 });

  } catch (error) {
    console.error('Onboarding completion route error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}