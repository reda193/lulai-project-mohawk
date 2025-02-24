import { FC } from 'react';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

interface CreateAgentButtonProps {
  onClick?: () => void; // Made optional since we'll primarily use the Link
}

const CreateAgentButton: FC<CreateAgentButtonProps> = ({ onClick }) => {
  return (
    <Link href="/agents/new">
      <button
        onClick={onClick}
        className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
      >
        <PlusIcon className="w-4 h-4" />
        <span className="text-sm font-medium">Create New Agent</span>
      </button>
    </Link>
  );
};

export default CreateAgentButton;