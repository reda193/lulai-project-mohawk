'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import SupportManagement from "@/components/SupportManagement/SupportManagement";

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <SupportManagement />
        </div>
    )
}
