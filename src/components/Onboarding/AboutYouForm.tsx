'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AboutYouFormProps {
  onComplete: (data: {
    discovery_source: string;
    switching_from: string;
  }) => void;
}

const AboutYouForm: React.FC<AboutYouFormProps> = ({ onComplete }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    discovery_source: '',
    switching_from: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no session
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const discoveryOptions = [
    { value: '', label: 'Select an option' },
    { value: 'search', label: 'Search Engine' },
    { value: 'social', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'other', label: 'Other' }
  ];

  const switchingOptions = [
    { value: '', label: 'Select an option' },
    { value: 'none', label: 'Not switching' },
    { value: 'intercom', label: 'Intercom' },
    { value: 'zendesk', label: 'Zendesk' },
    { value: 'chatgpt', label: 'ChatGPT' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      console.error('No user session found');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/onboarding/about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discovery_source: formData.discovery_source,
          switching_from: formData.switching_from,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save onboarding information');
      }

      // Call the onComplete prop to move to next step
      onComplete(formData);
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setIsSubmitting(false);
    }
  };

  // Show loading state while session is being validated
  if (status === 'loading') {
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <p className="text-sm text-gray-500 mt-2">About You</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="discovery" className="block text-sm font-medium text-gray-700 mb-1">
            How did you find us?
          </label>
          <select
            id="discovery"
            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.discovery_source}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              discovery_source: e.target.value
            }))}
            required
          >
            {discoveryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="switching" className="block text-sm font-medium text-gray-700 mb-1">
            Switching from another chat solution?
          </label>
          <select
            id="switching"
            className="w-full px-4 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.switching_from}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              switching_from: e.target.value
            }))}
            required
          >
            {switchingOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!formData.discovery_source || !formData.switching_from || isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
};

export default AboutYouForm;