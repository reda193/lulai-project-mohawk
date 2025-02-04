"use client"
import { Suspense } from "react"
import LoginForm from "@/components/ui/LoginForm";
// Main login page component
export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#D1C8C0] p-4">
            <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to your account
                    </p>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}