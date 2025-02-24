'use client';
// components/ui/SignOutButton.tsx
import { signOut } from "next-auth/react";

const SignOutButton = () => {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      Sign out
    </button>
  );
};

export default SignOutButton;