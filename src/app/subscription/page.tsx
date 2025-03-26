'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import SubscriptionManagement from "@/components/SubscriptionManagement/SubscriptionManagement";
import SidebarWrapper from "@/components/Sidebar/SidebarWrapper";
import { redirect } from "next/navigation"; 
export default async function SubscriptionPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }
    
    // TypeScript non-null assertion operator tells TypeScript that session is definitely not null
    const userRole = session!.user?.role || 'user';
    
    const userData = {
        firstName: session!.user?.first_name || '',
        lastName: session!.user?.last_name || '',
        role: userRole
    };
    return (
        <div>
            <SidebarWrapper userData={userData}>
                <SubscriptionManagement />
            </SidebarWrapper>
        </div>
    )
}
