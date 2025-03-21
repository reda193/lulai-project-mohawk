'use client';

import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
interface CreateAgentButtonProps {
  onClick?: () => void;
}

const CreateAgentButton: React.FC<CreateAgentButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      console.log('Creating new agent...');
      // Default implementation or redirection
    }
  };

  return (
    <Link href="/agents/new">
    <button
      onClick={handleClick}
      className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
    >
      <PlusIcon className="w-5 h-5" />
      <span>Create New Agent</span>
    </button>
    </Link>
  );
};

export default CreateAgentButton;