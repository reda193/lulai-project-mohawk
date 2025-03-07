'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import FeatureManagement from "@/components/FeatureManagement/FeatureManagement";

export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            <FeatureManagement />
        </div>
    )
}
