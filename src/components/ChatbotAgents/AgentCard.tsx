'use client';

import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AgentCardProps {
  name: string;
  status: string;
  onClick?: () => void;
}

const AgentCard = ({ name, status, onClick }: AgentCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior, e.g., navigate to agent details
      console.log('Agent clicked:', name);
      // router.push(`/agents/${name}`);
    }
  };

  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-md font-medium text-center">{name}</h3>
        <span className={`text-xs mt-1 ${status === 'Active' ? 'text-green-500' : 'text-yellow-500'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default AgentCard;