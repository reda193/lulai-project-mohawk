import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server"
import * as z from 'zod';

const userSchema = z.object({
    first_name: z.string()
        .min(2, 'First name must be at least 2 characters'),
    last_name: z.string()
        .min(2, 'Last name must be at least 2 characters'), 
    email: z.string()
        .email('Please enter a valid email address'),
    password: z.string()
        .regex(
            /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})/,
            'Password must contain at least 6 characters, one uppercase letter, one number and one special character'
        )
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, first_name, last_name, password } = userSchema.parse(body);

        const existingUserByEmail = await db.user.findUnique({
            where: { email }
        });

        if (existingUserByEmail) {
            return NextResponse.json({ 
                success: false,
                error: "Email already in use",
                code: "EMAIL_EXISTS"
            }, { 
                status: 409 
            });
        }

        const hashedPassword = await hash(password, 12);

        const newUser = await db.user.create({
            data: {
                first_name,
                last_name,
                email,
                password: hashedPassword,
                verified: false
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            success: true,
            message: "Account created successfully",
            user: {
                first_name: userWithoutPassword.first_name,
                last_name: userWithoutPassword.last_name,
                email: userWithoutPassword.email,
                createdAt: userWithoutPassword.createdAt
            }
        }, { 
            status: 201 
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: "Invalid input data",
                details: error.errors
            }, { 
                status: 400 
            });
        }

        if (error instanceof Error) {
            return NextResponse.json({
                success: false,
                error: "Failed to create account",
                code: "DATABASE_ERROR"
            }, { 
                status: 500 
            });
        }

        console.error("Registration error:", error);
        return NextResponse.json({
            success: false,
            error: "An unexpected error occurred",
            code: "INTERNAL_ERROR"
        }, { 
            status: 500 
        });
    }
}