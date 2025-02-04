"use client"
import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import GoogleSignInButton from "./GoogleSignInButton"

interface FormData {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
    submit?: string;
    [key: string]: string | undefined;
}

export default function LoginForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateForm = () => {
        const newErrors: FormErrors = {};
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (formData.password.length < 1) {
            newErrors.password = 'Password is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        if (validateForm()) {
            try {
                const response = await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });

                if (response?.error) {
                    switch (response.error) {
                        case "CredentialsSignin":
                            setErrors({ 
                                submit: 'Invalid email or password' 
                            });
                            break;
                        default:
                            setErrors({ 
                                submit: 'Login failed. Please try again.' 
                            });
                    }
                } else {
                    router.refresh(); 
                    router.push('/'); 
                }
            } catch (error) {
                console.error('Login error:', error);
                setErrors({ 
                    submit: 'Unable to connect to the server. Please try again.' 
                });
            }
        }
        
        setIsSubmitting(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john.doe@example.com"
                    />
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm transition-colors"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <div className="text-sm">
                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Forgot your password?
                        </a>
                    </div>
                </div>
            </div>

            {errors.submit && (
                <p className="text-sm text-red-600 text-center">{errors.submit}</p>
            )}

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
            </div>

            <div className="text-center text-sm">
                <span className="text-gray-600">Don&apos;t have an account?</span>
                {' '}
                <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </a>
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
            
            <GoogleSignInButton />
        </form>
    );
}