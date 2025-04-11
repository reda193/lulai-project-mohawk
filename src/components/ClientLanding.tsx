'use client';
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import AuthContainer from "@/components/ui/auth/AuthContainer";
import { LoginCredentials, SignUpCredentials } from "@/components/ui/auth/types";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionPicker from "@/components/Onboarding/SubscriptionPicker";
import AboutYouForm from "@/components/Onboarding/AboutYouForm";
import Image from "next/image";
import { useEffect } from "react";

const ClientLanding = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<'LOGIN_OPTIONS' | 'EMAIL_LOGIN' | 'SIGNUP'>('LOGIN_OPTIONS');
  const [onboardingStep, setOnboardingStep] = useState<'about' | 'subscription'>('about');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for error in URL query params (from NextAuth)
    const errorParam = searchParams.get('error');
    if (errorParam) {
      let errorMessage = "An unexpected error occurred";
      
      // Parse NextAuth error codes
      switch (errorParam) {
        case 'CredentialsSignin':
          errorMessage = "Invalid email or password";
          break;
        case 'EmailSignin':
          errorMessage = "Email login failed";
          break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
          errorMessage = "Social login failed";
          break;
        default:
          errorMessage = "Login failed: " + errorParam;
      }
      
      setError(errorMessage);
      
      // Force EMAIL_LOGIN mode if there's a credentials error
      if (errorParam === 'CredentialsSignin') {
        setMode('EMAIL_LOGIN');
      }
    }
    
    // Session status logging
    if (status === 'authenticated' && session?.user?.hasCompletedOnboarding) {
      // Redirect to dashboard if user is authenticated and has completed onboarding
      router.push('/dashboard');
    }
  }, [session, status, router, searchParams]);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      // Clear any previous errors
      setError(null);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });
  
      if (result?.error) {
        // Parse the error message
        setError(result.error);
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
      // Error is already set above
      throw error;
    }
  };

  const handleSignUp = async (credentials: SignUpCredentials) => {
    try {
      // Clear any previous errors
      setError(null);
      
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

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        let errorMessage = data.error || 'Registration failed';
        
        if (data.code === 'EMAIL_EXISTS') {
          errorMessage = 'Email already in use';
        } else if (data.details && Array.isArray(data.details)) {
          // Extract validation errors
          const validationError = data.details[0];
          errorMessage = validationError.message || 'Invalid input data';
        }
        
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      // Registration successful, switch to login mode
      setMode('LOGIN_OPTIONS');
      
      // Optional: Show success message or automatically log in the user
    } catch (error) {
      console.error('Registration error:', error);
      // Error is already set above
      throw error;
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      // Clear any previous errors
      setError(null);
      
      // For social logins, we'll use redirect flow
      await signIn(provider, {
        callbackUrl: '/dashboard',
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setError(`${provider} login failed`);
      throw error;
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
    router.push('/dashboard');
  };

  // If session is loading, show nothing or a loading state
  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render content based on authentication and onboarding status
  return (
    <div className="flex flex-col md:flex-row max-w-[90rem] mx-auto min-h-screen">
      {/* Left Section - Logo */}
      {status === 'unauthenticated' && (
        <div className="md:flex-1 flex flex-col items-center justify-center px-4 py-12 md:pr-16 md:mt-24">
          <div className="relative w-64 h-64 md:w-[40rem] md:h-[40rem]">
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
      <div className="md:flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {status === 'unauthenticated' ? (
            <AuthContainer
              mode={mode}
              onModeChange={setMode}
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              onSocialLogin={handleSocialLogin}
              initialError={error}
            />
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
    </div>
  );
};

export default ClientLanding;