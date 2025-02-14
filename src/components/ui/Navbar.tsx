'use server';
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import Link from "next/link";
import Useracountnav from "./Useracountnav";
const Nav = async () => {
  const session = await getServerSession(authOptions);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            LulAI
          </Link>

          <div className="flex items-center gap-6">
            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Welcome, {session.user.first_name}
                </span>
                <Useracountnav />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium bg-[#6366F1] text-white px-6 py-2 rounded-md hover:bg-[#4F46E5] transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


export default Nav;