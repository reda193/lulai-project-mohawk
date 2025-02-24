// app/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Nav from "@/components/ui/Navbar";
import ClientLanding from "@/components/ClientLanding";
import { redirect } from "next/navigation";
export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/home');
  }

  return (
    <div className="min-h-screen bg-white">
      <ClientLanding />
    </div>
  );
}