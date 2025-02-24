'use client';

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
}) => {
  const handleSwitchMode = (newMode: AuthMode) => {
    onModeChange?.(newMode);
  };

  return (
    <div className="w-full max-w-md p-10 space-y-4 border border-gray-200 rounded-3xl shadow-sm bg-white">
      {mode === 'LOGIN_OPTIONS' && (
        <LoginOptions
          onEmailClick={() => handleSwitchMode('EMAIL_LOGIN')}
          onSocialLogin={onSocialLogin}
          onSignUpClick={() => handleSwitchMode('SIGNUP')}
        />
      )}

      {mode === 'EMAIL_LOGIN' && (
        <EmailLoginForm
          onSubmit={onLogin || (async () => {})} 
          onBack={() => handleSwitchMode('LOGIN_OPTIONS')}
        />
      )}

      {mode === 'EMAIL_LOGIN' && (
        <EmailLoginForm
          onSubmit={onLogin || (async () => {})} 
          onBack={() => handleSwitchMode('LOGIN_OPTIONS')}
        />
      )}
    </div>
  );
};

export default AuthContainer;