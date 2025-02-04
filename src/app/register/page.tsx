'use client';
import { useState, ChangeEvent, FormEvent } from "react"
import { useRouter } from "next/navigation";

interface ValidationError {
  path: string[];
  message: string;
}

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    submit?: string;
}

interface ValidationState {
    firstName: boolean;
    lastName: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [touched, setTouched] = useState<ValidationState>({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false
    });
    const [isValid, setIsValid] = useState<ValidationState>({
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        confirmPassword: false
    });

    const validateField = (name: keyof FormData, value: string): boolean => {
        switch(name) {
            case 'firstName':
            case 'lastName':
                return value.length >= 2;
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'password':
                return /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/.test(value);
            case 'confirmPassword':
                return value === formData.password;
            default:
                return false;
        }
    };

    const getInputStyle = (fieldName: keyof FormData): string => {
        const baseStyle = "mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 text-sm transition-all duration-200";
        
        if (!touched[fieldName]) {
            return `${baseStyle} border-gray-300 focus:border-indigo-500 focus:ring-indigo-500`;
        }
        
        return isValid[fieldName]
            ? `${baseStyle} border-green-500 bg-green-50 focus:border-green-600 focus:ring-green-500`
            : `${baseStyle} border-red-500 bg-red-50 focus:border-red-600 focus:ring-red-500`;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof FormData;
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        setTouched(prev => ({
            ...prev,
            [fieldName]: true
        }));

        const isFieldValid = validateField(fieldName, value);
        setIsValid(prev => ({
            ...prev,
            [fieldName]: isFieldValid
        }));

        // Special handling for confirmPassword validation
        if (fieldName === 'password') {
            const isConfirmValid = formData.confirmPassword === value;
            setIsValid(prev => ({
                ...prev,
                confirmPassword: isConfirmValid
            }));
        }

        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const getErrorMessage = (fieldName: keyof FormData): string => {
        if (!touched[fieldName]) return '';
        
        switch(fieldName) {
            case 'firstName':
            case 'lastName':
                return `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
            case 'email':
                return 'Please enter a valid email address';
            case 'password':
                return 'Password must meet all requirements';
            case 'confirmPassword':
                return 'Passwords must match';
            default:
                return '';
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const allFieldsValid = Object.values(isValid).every(valid => valid);
        
        if (allFieldsValid) {
            try {
                const response = await fetch('/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        email: formData.email,
                        password: formData.password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    router.push('/login?message=Account created successfully');
                } else {
                    switch (response.status) {
                        case 409:
                            setErrors({ submit: data.error || 'Email already in use' });
                            break;
                        case 400:
                            if (data.details) {
                                const serverErrors: FormErrors = {};
                                data.details.forEach((error: ValidationError) => {
                                    const field = error.path[0] as keyof FormErrors;
                                    serverErrors[field] = error.message;
                                });
                                setErrors(serverErrors);
                            } else {
                                setErrors({ submit: data.error || 'Invalid input data' });
                            }
                            break;
                        default:
                            setErrors({ submit: data.error || 'Registration failed. Please try again.' });
                    }
                }
            } catch (error) {
                setErrors({ 
                    submit: 'Unable to connect to the server. Please check your internet connection and try again.' 
                });
                console.error('Registration error:', error);
            }
        } else {
            // Mark all fields as touched to show errors
            setTouched({
                firstName: true,
                lastName: true,
                email: true,
                password: true,
                confirmPassword: true
            });
        }

        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#D1C8C0] p-4">
            <div className="w-full max-w-md space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Join us today and get started
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className={getInputStyle('firstName')}
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                />
                                {touched.firstName && !isValid.firstName && (
                                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('firstName')}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className={getInputStyle('lastName')}
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                />
                                {touched.lastName && !isValid.lastName && (
                                    <p className="mt-1 text-xs text-red-600">{getErrorMessage('lastName')}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={getInputStyle('email')}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john.doe@example.com"
                            />
                            {touched.email && !isValid.email && (
                                <p className="mt-1 text-xs text-red-600">{getErrorMessage('email')}</p>
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
                                className={getInputStyle('password')}
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <div className="mt-1 text-xs text-gray-500">
                                <p>Password must:</p>
                                <ul className="list-disc pl-5 space-y-1 mt-1">
                                    <li className={formData.password.length >= 6 ? "text-green-600" : ""}>
                                        Be at least 6 characters long
                                    </li>
                                    <li className={/[A-Z]/.test(formData.password) ? "text-green-600" : ""}>
                                        Include one capital letter
                                    </li>
                                    <li className={/[0-9]/.test(formData.password) ? "text-green-600" : ""}>
                                        Include one number
                                    </li>
                                    <li className={/[!@#$%^&*]/.test(formData.password) ? "text-green-600" : ""}>
                                        Include one special character (!@#$%^&*)
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className={getInputStyle('confirmPassword')}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {touched.confirmPassword && !isValid.confirmPassword && (
                                <p className="mt-1 text-xs text-red-600">{getErrorMessage('confirmPassword')}</p>
                            )}
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
                            {isSubmitting ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}