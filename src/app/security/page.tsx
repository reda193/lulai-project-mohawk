'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import SecurityManagement from "@/components/SecurityManagement/SecurityManagement"

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <SecurityManagement />
        </div>
    )
}
