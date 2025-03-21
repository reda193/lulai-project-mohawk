import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { InfoIcon } from "lucide-react";
import Link from "next/link";
import ClientNav from "./ClientNav";

const Nav = async () => {
  const session = await getServerSession(authOptions);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/90 z-50 border-b border-gray-200">
      <div className="flex h-20 items-center max-w-[90rem] mx-auto">
        <div className="flex-1 flex justify-start pl-16">
          <Link 
            href="/dashboard" 
            className="block relative w-64 h-24" // Increased container size
          >
            <img
              src="/logos/lulailogo2.png"
              alt="LulAI Logo"
              className="absolute inset-0 max-w-full max-h-full object-contain m-auto scale-125" // Added scale-125
            />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-end pr-16">
          {session ? (
            <ClientNav
              firstName={session.user.first_name ?? ''}
              email={session.user.email ?? ''}
            />
          ) : (
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <InfoIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;