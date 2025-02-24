'use client';
import { useState } from 'react';
import AboutYouForm from './AboutYouForm';
import SubscriptionPicker from './SubscriptionPicker';

interface OnboardingFlowProps {
  userId: number;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState<'about' | 'subscription'>('about');
  const [aboutData, setAboutData] = useState<{
    discovery_source?: string;
    switching_from?: string;
  }>({});

  const handleAboutComplete = async (data: typeof aboutData) => {
    try {
      await fetch('/api/onboarding/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });
      setAboutData(data);
      setStep('subscription');
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
    }
  };

  const handleSubscriptionComplete = async (planType: 'FREE' | 'BASIC' | 'PRO') => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planType,
          onboardingData: aboutData
        }),
      });
      onComplete();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  return (
    <div className="w-full">
      {step === 'about' && (
        <AboutYouForm onComplete={handleAboutComplete} />
      )}
      {step === 'subscription' && (
        <SubscriptionPicker onComplete={handleSubscriptionComplete} />
      )}
    </div>
  );
};

export default OnboardingFlow;