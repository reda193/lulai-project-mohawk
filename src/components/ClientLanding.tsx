'use client';
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import OnboardingFlow from "@/components/Onboarding/OnboardingFlow";
import AuthContainer from "@/components/ui/auth/AuthContainer";
import { LoginCredentials, SignUpCredentials } from "@/components/ui/auth/types";
import { useRouter } from "next/navigation";
import SubscriptionPicker from "@/components/Onboarding/SubscriptionPicker";
import AboutYouForm from "@/components/Onboarding/AboutYouForm";
import Image from "next/image";
import { useEffect } from "react";
const ClientLanding = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<'LOGIN_OPTIONS' | 'EMAIL_LOGIN' | 'SIGNUP'>('LOGIN_OPTIONS');
  const [onboardingStep, setOnboardingStep] = useState<'about' | 'subscription'>('about');

  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
    console.log("Has completed onboarding:", session?.user?.hasCompletedOnboarding);
    
    // Force render of onboarding if user is authenticated
    if (status === 'authenticated') {
      // Log all user properties to see what we have
      console.log("All user properties:", Object.keys(session.user));
      console.log("Session user object:", session.user);
    }
  }, [session, status]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });
  
      if (result?.error) {
        console.error('Login failed:', result.error);
        throw new Error(result.error);
      }
      
      // After successful login, we need to fetch the latest session
      // to check if onboarding is needed
      const session = await fetch('/api/auth/session');
      const sessionData = await session.json();
      
      if (sessionData?.user?.hasCompletedOnboarding) {
        // User has completed onboarding, redirect to dashboard
          window.location.href = '/dashboard';
      }
      // Otherwise, the component will re-render with authenticated state
      // and show the onboarding flow
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleSignUp = async (credentials: SignUpCredentials) => {
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: credentials.firstName,
          last_name: credentials.lastName,
          email: credentials.email,
          password: credentials.password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      setMode('LOGIN_OPTIONS');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await signIn(provider, {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
    }
  };

  const handleAboutComplete = (data: { 
    discovery_source?: string; 
    switching_from?: string; 
  }) => {
    // Save about data and move to subscription step
    setOnboardingStep('subscription');
  };

  const handleOnboardingComplete = () => {
    router.push('/home');
  };

  // If session is loading, show nothing or a loading state
  if (status === 'loading') {
    return null; // or a loading spinner
  }

  // Render content based on authentication and onboarding status
  return (
    <div className="flex max-w-[90rem] mx-auto">
      {/* Left Section - Logo */}
      {status === 'unauthenticated' && (
        <div className="flex-1 flex flex-col items-center pr-16 mt-24">
          <div className="relative w-[40rem] h-[40rem]">
            <Image
              src="/logos/lulailogo.png"
              alt="Lulai Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

      {/* Right Section - Auth or Onboarding */}
      <div className="flex-1 flex items-center justify-start">
        {status === 'unauthenticated' ? (
          <div className="w-full max-w-md">
            <AuthContainer
              mode={mode}
              onModeChange={setMode}
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              onSocialLogin={handleSocialLogin}
            />
          </div>
        ) : session && !session.user.hasCompletedOnboarding ? (
          <div className="w-full">
            {onboardingStep === 'about' ? (
              <AboutYouForm 
                onComplete={handleAboutComplete} 
              />
            ) : (
              <SubscriptionPicker 
                onComplete={handleOnboardingComplete} 
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClientLanding;
