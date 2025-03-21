'use server';
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth"


export default async function Analytics() {
    const session = await getServerSession(authOptions);
    return (
        <div>
         
        </div>
    )
}
