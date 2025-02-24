import { FC } from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { VisitorData } from '@/types/dashboard';

interface VisitorsMapProps {
  data: VisitorData[];
}

const VisitorsMap: FC<VisitorsMapProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Visitors Location</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="w-full h-48 bg-gray-50 rounded-lg">
        {/* Map visualization will go here */}
      </div>
    </div>
  );
};

export default VisitorsMap;