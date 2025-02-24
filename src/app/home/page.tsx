
'use server';
import User from "@/components/ui/User"
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"
import Link from "next/link"
import AboutYouForm from "@/components/Onboarding/AboutYouForm";
import SubscriptionPicker from "@/components/Onboarding/SubscriptionPicker";
export default async function HomePage() {
    const session = await getServerSession(authOptions);
    return (
        <div>
            
            Home Pagee
        </div>
    )
}