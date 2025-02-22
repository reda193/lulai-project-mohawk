"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Home from "@/components/dashboard/Home";

const Admin = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-4xl font-bold">Please login to view this page</h1>
      </div>
    );
  }

  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <h1 className="text-4xl font-bold">Unauthorized Access</h1>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Home />
    </div>
  );
};

export default Admin;
