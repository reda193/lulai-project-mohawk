
'use server';
import User from "@/components/ui/User"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import Link from "next/link"

export default async function HomePage() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            Home Pagee
            <Link href="/admin">Open my admin</Link>

            <h2>Client session</h2>
            <User />
            <h2>Server Session</h2>
            {JSON.stringify(session)}
        </div>
    )
}