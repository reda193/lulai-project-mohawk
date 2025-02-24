'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { SignUpFormProps } from './types';

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

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, onBack }) => {
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
        const baseStyle = "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm transition-all duration-200";
        
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
                await onSubmit({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    password: formData.password
                });
            } catch (error) {
                setErrors({ 
                    submit: 'Registration failed. Please try again.' 
                });
                console.error('Registration error:', error);
            }
        } else {
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
        <>
            <div className="text-center relative">
                <button
                    onClick={onBack}
                    className="absolute left-6 top-6 text-gray-600 hover:text-gray-900"
                >
                    <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-semibold">Create Account</h2>
                <p className="text-sm text-gray-500 mt-2">Sign up to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
            </form>
        </>
    );
};

export default SignUpForm;