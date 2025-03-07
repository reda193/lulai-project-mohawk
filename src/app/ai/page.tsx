'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import AIManagement from "@/components/AIManagement/AIManagement";
export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <AIManagement />
        </div>
    )
}
