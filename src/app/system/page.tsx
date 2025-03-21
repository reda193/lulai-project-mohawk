'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import SystemManagement from "@/components/SystemManagement/SystemManagement"; 

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <SystemManagement />
        </div>
    )
}