'use client';

import { MdEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { LoginOptionsProps } from './types';

const LoginOptions: React.FC<LoginOptionsProps> = ({
  onEmailClick,
  onSignUpClick,
  onSocialLogin,
  isLoading = false
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
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <MdEmail size={20} />
          Log in with Email
        </button>
        
        <button
          onClick={() => onSocialLogin?.('google')}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <FcGoogle size={20} />
          Log in with Google
        </button>
                  
        <button
          onClick={() => onSocialLogin?.('apple')}
          className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          <FaApple size={20} />
          Log in with Apple
        </button>
      </div>

      <div className="text-center text-sm text-gray-500 pt-2">
        Don&apos;t have an account?{' '}
        <button 
          onClick={onSignUpClick}
          className="text-blue-600 hover:underline font-medium disabled:text-blue-400 disabled:no-underline disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          Sign up
        </button>
      </div>
    </>
  );
};

export default LoginOptions;