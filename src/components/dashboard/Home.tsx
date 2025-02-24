import { Sidebar, User } from "lucide-react";
<Sidebar />
const customers = [
  { name: "John Doe", amount: "$10,000", country: "USA", date: "2023-10-15", status: "Active" },
  { name: "Jane Smith", amount: "$850.50", country: "Canada", date: "2023-10-14", status: "Pending" },
  { name: "Michael Johnson", amount: "$5,000", country: "UK", date: "2023-10-13", status: "Inactive" },
  { name: "Emily Brown", amount: "$650.75", country: "Australia", date: "2023-10-12", status: "Active" },
  { name: "David Wilson", amount: "$300.20", country: "Germany", date: "2023-10-11", status: "Inactive" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <span className="text-green-600 bg-green-100 px-2 py-1 rounded-md text-xs">Active</span>;
    case "Pending":
      return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md text-xs">Pending</span>;
    case "Inactive":
      return <span className="text-red-600 bg-red-100 px-2 py-1 rounded-md text-xs">Inactive</span>;
    default:
      return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs">{status}</span>;
  }
};

const Customers = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="py-2 text-left font-medium text-gray-600 px-2">User</th>
              <th className="py-2 text-left font-medium text-gray-600 px-2">Total Amount</th>
              <th className="py-2 text-left font-medium text-gray-600 px-2">Country</th>
              <th className="py-2 text-left font-medium text-gray-600 px-2">Date</th>
              <th className="py-2 text-left font-medium text-gray-600 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index} className="border-b">
                <td className="py-3 px-2">{customer.name}</td>
                <td className="px-2">{customer.amount}</td>
                <td className="px-2">{customer.country}</td>
                <td className="px-2">{customer.date}</td>
                <td className="px-2">{getStatusBadge(customer.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="h-screen w-screen grid place-items-center bg-gray-100">
      <div className="w-full max-w-4xl p-6 space-y-6 bg-white rounded-xl shadow-md">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="bg-white p-6 rounded-xl shadow-md">
        <h1>Home</h1>
      </div>
      <button className="p-4 bg-gray-100 rounded-lg text-gray-700 text-sm font-semibold text-left">
        + Create New Agent
      </button>

      </div>
        {/* Chatbot Agents Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mt-4">Chatbot Agents Deployed</h3>
          <div className="flex gap-4 mt-2">
            {/* Chatbot Agent Card */}
            {[
              { name: "Shopify", status: "green" },
              { name: "Testing", status: "yellow" },
              { name: "Shopify Old", status: "red" },
            ].map((agent, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <User size={20} color="white" />
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                      agent.status === "green"
                        ? "bg-green-500"
                        : agent.status === "yellow"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                </div>
                <p className="text-sm mt-1">{agent.name}</p>
              </div>
            ))}
          </div>
      {/* Quick Analytics */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Analytics</h2>

        <div className="flex justify-between items-center">
          {/* Visitors Location Placeholder */}
          <div className="w-1/2 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm">Visitors Location</p>
            <div className="h-24 bg-gray-300 rounded-md mt-2 flex items-center justify-center">
              <span className="text-gray-500"><img src="/map.png" alt="Map Image" />
              </span>
            </div>
          </div>

          {/* Replies Section */}
          <div className="w-1/2 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm">Replies</p>
            <div className="mt-4 flex justify-center">
            <img src="/pie.png" alt="Map Image" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-gray-500 text-sm">Last Week</p>
                <h3 className="text-xl font-semibold">$1,890.6</h3>
              </div>
              <div>
                <p className="text-gray-500 text-sm">This Week</p>
                <h3 className="text-xl font-semibold text-red-500">
                  $1,276.3 <span className="text-xs text-gray-500">↓ 25%</span>
                </h3>
              </div>
            </div>
          </div>
        </div>

       
        </div>
      </div>

      {/* Top Customers Section */}
      <Customers />
    </div>
    </div>
  );
};

export default Home;
