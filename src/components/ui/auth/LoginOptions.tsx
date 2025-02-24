'use client';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faGoogle, 
  faFacebook, 
  faApple 
} from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

interface LoginOptionsProps {
  onEmailClick: () => void;
  onSignUpClick: () => void;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'apple') => void;
}

const LoginOptions: React.FC<LoginOptionsProps> = ({
  onEmailClick,
  onSignUpClick,
  onSocialLogin,
}) => {
  return (
    <>
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Welcome</h2>
        <p className="text-sm text-gray-500 mt-2">Log in your account</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={onEmailClick}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5" />
          Log in with Email
        </button>
        
        <button
          onClick={() => onSocialLogin?.('google')}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />
          Log in with Google
        </button>
                
        <button
          onClick={() => onSocialLogin?.('apple')}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FontAwesomeIcon icon={faApple} className="w-5 h-5" />
          Log in with Apple
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 pt-2">
        Don&apos;t have an account?{' '}
        <button 
          onClick={onSignUpClick}
          className="text-blue-600 hover:underline font-medium"
        >
          Sign up
        </button>
      </div>
    </>
  );
};

export default LoginOptions;