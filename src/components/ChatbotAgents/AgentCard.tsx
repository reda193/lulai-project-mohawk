'use client';

import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BotAppearance {
  bot_avatar?: string | null;
  company_logo?: string | null;
  accent_color?: string | null;
}

interface AgentCardProps {
  id: string;
  name: string;
  status: string;
  appearance?: BotAppearance | null;
  onClick?: () => void;
}

const AgentCard = ({ id, name, status, appearance, onClick }: AgentCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - navigate to agent overview
      router.push(`/agents/${id}/overview`);
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 overflow-hidden">
          {appearance?.bot_avatar ? (
            <Image
              src={appearance.bot_avatar}
              alt={`${name} avatar`}
              width={48}
              height={48}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-gray-700" />
            </div>
          )}
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