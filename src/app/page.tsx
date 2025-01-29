import Navbar from "@/components/layout/Navbar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If no session, show login prompt
  if (!session) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#D1C8C0]">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Please Register/Login
          </h1>
        </div>
      </>
    );
  }

  if (session.user.role === "ADMIN") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#D1C8C0]">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Super Admin Dashboard
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#D1C8C0]">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Member Dashboard
        </h1>
      </div>
    </>
  );
}