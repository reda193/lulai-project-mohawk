'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import ApiManagement from "@/components/ApiManagement/ApiManagement";

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            <ApiManagement />
        </div>
    )
}
