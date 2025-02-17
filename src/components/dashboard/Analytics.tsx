import { PieChart } from "lucide-react";

const Analytics = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Quick Analytics</h2>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-500">Last Week</p>
          <h3 className="text-2xl font-bold">$1,890.6</h3>
        </div>
        <div>
          <p className="text-gray-500">This Week</p>
          <h3 className="text-2xl font-bold text-red-500">$1,276.3</h3>
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <PieChart size={80} />
      </div>
    </div>
  );
};

export default Analytics;
