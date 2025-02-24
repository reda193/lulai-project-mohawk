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

export interface AuthContainerProps {
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
  onSignUp?: (credentials: SignUpCredentials) => Promise<void>;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  isLoading?: boolean;
}

export interface LoginOptionsProps {
  onEmailClick: () => void;
  onSignUpClick: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => Promise<void>;
  isLoading?: boolean;
}

export interface EmailLoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

export interface SignUpFormProps {
  onSubmit: (credentials: SignUpCredentials) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}