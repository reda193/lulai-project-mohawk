import { FC } from 'react';
import { Customer } from '@/types/dashboard';

interface CustomerTableProps {
  customers: Customer[];
}

const CustomerTable: FC<CustomerTableProps> = ({ customers }) => {
  return (
    <div className="bg-white rounded-lg">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold">Top Customers</h2>
      </div>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Country</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((customer, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm">{customer.name}</td>
              <td className="px-6 py-4 text-sm font-medium">{customer.total}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{customer.country}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{customer.date}</td>
              <td className="px-6 py-4">
                <span className={`
                  px-2 py-1 text-xs font-medium rounded-full
                  ${customer.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    customer.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-blue-100 text-blue-800'}
                `}>
                  {customer.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;