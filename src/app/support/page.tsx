'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import SupportManagement from "@/components/SupportManagement/SupportManagement";
import SidebarWrapper from "@/components/Sidebar/SidebarWrapper";
import { redirect } from "next/navigation";
export default async function Analytics() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/');
    }
    
    if (session.user?.role !== 'ADMIN') {
        redirect('/dashboard');
    }
    
    // Since we've checked that session isn't null, we can safely access its properties
    // Also added the missing userRole variable
    const userRole = session.user?.role || 'user'; // Default to 'user' if role is undefined
    
    const userData = {
        firstName: session.user?.first_name || '',
        lastName: session.user?.last_name || '',
        role: userRole
    };
    return (
        <div>
            <SidebarWrapper userData={userData}>
                <SupportManagement />
            </SidebarWrapper>
        </div>
    )
}
