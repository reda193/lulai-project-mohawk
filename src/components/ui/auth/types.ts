// components/ui/auth/types.ts
export type AuthMode = 'LOGIN_OPTIONS' | 'EMAIL_LOGIN' | 'SIGNUP';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code: string;
}

export interface AuthContainerProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
  onSignUp?: (credentials: SignUpCredentials) => Promise<void>;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  initialError?: string | null;  // Add this prop for initial error state
  isLoading?: boolean;
}

export interface LoginOptionsProps {
  onEmailClick: () => void;
  onSignUpClick: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  isLoading?: boolean;
    error?: string | null;  // Add error prop

}

export interface EmailLoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;  // Add error prop

}

export interface SignUpFormProps {
  onSubmit: (credentials: SignUpCredentials) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;  // Add error prop

}