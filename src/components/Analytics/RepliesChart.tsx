import { FC } from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { ReplyData } from '@/types/dashboard';

interface RepliesChartProps {
  data: ReplyData[];
}

const RepliesChart: FC<RepliesChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Replies</h2>
        <button>
          <MoreHorizontalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      <div className="flex items-center justify-center">
        <div className="w-48 h-48 bg-gray-50 rounded-full">
          {/* Pie chart will go here */}
        </div>
      </div>
      <div className="mt-4 flex justify-between text-sm">
        <div>$1,896.5</div>
        <div>$1,276.3</div>
      </div>
    </div>
  );
};

export default RepliesChart;