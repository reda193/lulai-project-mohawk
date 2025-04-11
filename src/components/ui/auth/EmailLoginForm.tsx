'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { EmailLoginFormProps } from './types';

const EmailLoginForm: React.FC<EmailLoginFormProps> = ({ onSubmit, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <>
      <div className="text-center relative">
        <button
          onClick={onBack}
          className="absolute left-0 top-0 text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-2">Log in with email</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
        >
          Log in
        </button>
      </form>

      <div className="text-center text-sm mt-4">
        <a href="#" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>
    </>
  );
};

export default EmailLoginForm;