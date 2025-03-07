'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import ClientManagement from "@/components/ClientManagement/ClientManagement";

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            <ClientManagement />
        </div>
    )
}
