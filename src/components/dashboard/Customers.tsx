const customers = [
    { name: "John Doe", amount: "$10,000", country: "USA", date: "2023-10-15", status: "Active" },
    { name: "Jane Smith", amount: "$850.50", country: "Canada", date: "2023-10-14", status: "Pending" },
    { name: "Michael Johnson", amount: "$5,000", country: "UK", date: "2023-10-13", status: "Active" },
  ];
  
  const Customers = () => {
    return (
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">Top Customers</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">User</th>
              <th>Total Amount</th>
              <th>Country</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{customer.name}</td>
                <td>{customer.amount}</td>
                <td>{customer.country}</td>
                <td>{customer.date}</td>
                <td>{customer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default Customers;
  