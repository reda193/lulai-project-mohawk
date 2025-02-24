'use server';

import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import Nav from "@/components/ui/Navbar";

const Admin = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <>
                <Nav />
                <div className="min-h-screen flex items-center justify-center bg-stone-200">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Please ddd to ddd this page
                    </h1>
                </div>
            </>
        )
    }

    if (session?.user.role === 'ADMIN') {
        return (
            <>
                <Nav />
                <div className="min-h-screen flex items-center justify-center bg-stone-200">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                        Super Admin Dashboard - Welcome back {session?.user.name}
                    </h1>
                </div>
            </>
        )
    }

    return (
        <>
            <Nav />
            <div className="min-h-screen flex items-center justify-center bg-stone-200">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Member Dashboard - Welcome back {session?.user.name}
                </h1>
            </div>
        </>
    )
}

export default Admin