'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import SubscriptionManagement from "@/components/SubscriptionManagement/SubscriptionManagement";
export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <SubscriptionManagement />
        </div>
    )
}
