'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
  name: 'Free' | 'Basic' | 'Pro';
  price: number;
  features: string[];
  buttonText: string;
  recommended?: boolean;
}

const SubscriptionPicker = ({ onComplete }: { onComplete: (planType: 'FREE' | 'BASIC' | 'PRO') => void }) => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      name: 'Free',
      price: 0,
      features: [
        'Basic chatbot',
        '1k messages/month',
        'Limited integrations'
      ],
      buttonText: 'Get Started'
    },
    {
      name: 'Basic',
      price: 20,
      features: [
        'Advanced features',
        'Optimized messages',
        '10k messages/month',
        'Basic integration'
      ],
      buttonText: 'Upgrade',
      recommended: true
    },
    {
      name: 'Pro',
      price: 49,
      features: [
        'All Basic features',
        'Enterprise-level support',
        'Unlimited messages',
        'Advanced integrations',
        'Custom solutions'
      ],
      buttonText: 'Upgrade'
    }
  ];

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    onComplete(plan.name.toUpperCase() as 'FREE' | 'BASIC' | 'PRO');
  };

  const handleContinue = () => {
    router.push('/home');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.name}
            className={`
              relative border rounded-lg p-6 transition-all duration-300 
              ${plan.recommended ? 'border-blue-500 bg-white shadow-2xl scale-105' : 'border-gray-200'}
              hover:shadow-xl hover:border-blue-300
              ${selectedPlan?.name === plan.name ? 'ring-4 ring-blue-500' : ''}
            `}
            onClick={() => handlePlanSelect(plan)}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                Recommended
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            
            <div className="mb-4">
              <span className="text-4xl font-extrabold">${plan.price}</span>
              <span className="text-gray-500 ml-2">per month</span>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button 
              className={`
                w-full py-3 rounded-lg transition-colors duration-300
                ${plan.recommended 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'border border-blue-500 text-blue-500 hover:bg-blue-50'}
              `}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center space-y-6">
        <button 
          onClick={handleContinue}
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Continue to Dashboard
        </button>

        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
          <details className="border-b pb-4">
            <summary className="cursor-pointer font-semibold">
              Am I able to switch plans anytime?
            </summary>
            <p className="mt-2 text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
            </p>
          </details>
          <details className="border-b pb-4">
            <summary className="cursor-pointer font-semibold">
              Is there a trial available for paid plans?
            </summary>
            <p className="mt-2 text-gray-600">
              We offer a 7-day free trial for our Basic and Pro plans. No credit card required.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPicker;