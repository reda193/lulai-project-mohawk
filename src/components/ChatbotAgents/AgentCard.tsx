import { FC } from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { ChatbotAgent } from '@/types/dashboard';

interface AgentCardProps extends ChatbotAgent {
  onClick?: () => void;
}

const AgentCard: FC<AgentCardProps> = ({ name, status, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg p-4 text-center cursor-pointer"
    >
      <div className="w-12 h-12 bg-black rounded-full mx-auto mb-3 flex items-center justify-center">
        <MessageSquareIcon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-green-500 mt-1">{status}</p>
    </div>
  );
};

export default AgentCard;