"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Analytics from "@/components/dashboard/Analytics";
import Customers from "@/components/dashboard/Customers";

const Admin = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-4xl font-bold">Please login to view this page</h1>
      </div>
    );
  }

  if (session?.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-4xl font-bold">Unauthorized Access</h1>
      </div>
    );
  }

  return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Analytics />
        <Customers />
      </div>
  );
};

export default Admin;
