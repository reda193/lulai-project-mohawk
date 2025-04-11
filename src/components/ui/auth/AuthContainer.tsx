'use client';

import { useState, useEffect } from 'react';
import { AuthContainerProps, AuthMode } from './types';
import LoginOptions from './LoginOptions';
import EmailLoginForm from './EmailLoginForm';
import SignUpForm from './SignUpForm';

const AuthContainer: React.FC<AuthContainerProps> = ({
  mode = 'LOGIN_OPTIONS',
  onModeChange,
  onLogin,
  onSignUp,
  onSocialLogin,
  initialError = null
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  
  // Update error state when initialError prop changes
  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleSwitchMode = (newMode: AuthMode) => {
    // Clear errors when switching modes
    setError(null);
    onModeChange?.(newMode);
  };

  const handleLogin = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onLogin?.(credentials);
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (credentials: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSignUp?.(credentials);
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create account');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLoginWithLoading = async (provider: 'google' | 'facebook' | 'apple') => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSocialLogin?.(provider);
    } catch (err: any) {
      setError(`Failed to login with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-10 space-y-4 border border-gray-200 rounded-3xl shadow-sm bg-white relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center rounded-3xl z-10">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-700 font-medium">
              {mode === 'SIGNUP' ? 'Creating your account...' : 'Logging you in...'}
            </p>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {mode === 'LOGIN_OPTIONS' && (
        <LoginOptions
          onEmailClick={() => handleSwitchMode('EMAIL_LOGIN')}
          onSocialLogin={handleSocialLoginWithLoading}
          onSignUpClick={() => handleSwitchMode('SIGNUP')}
          isLoading={isLoading}
        />
      )}

      {mode === 'EMAIL_LOGIN' && (
        <EmailLoginForm
          onSubmit={handleLogin} 
          onBack={() => handleSwitchMode('LOGIN_OPTIONS')}
          isLoading={isLoading}
          error={error}
        />
      )}

      {mode === 'SIGNUP' && (
        <SignUpForm
          onSubmit={handleSignUp} 
          onBack={() => handleSwitchMode('LOGIN_OPTIONS')}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default AuthContainer;