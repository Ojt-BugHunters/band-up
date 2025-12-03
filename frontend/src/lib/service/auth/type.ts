import z from 'zod';

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, { message: 'Enter the 6-digit otp code' })
        .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

export type VerifyOtpVars = { email: string; otp: string };

export type OtpFormValues = z.infer<typeof otpSchema>;

export const passwordSchema = z
    .string()
    .nonempty({ message: 'Password must not be empty' })
    .min(6, { message: 'Password must be at least 6 characters' })
    .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, {
        message: 'Password must contain at least one special character',
    });

export const loginSchema = z.object({
    email: z.string().min(1, { message: 'Email must not be empty' }),
    password: passwordSchema,
});

export const registerSchema = z
    .object({
        email: z.string().email({ message: 'Invalid email address' }),
        password: passwordSchema,
        confirmPassword: z
            .string()
            .nonempty({ message: 'Password must not be empty' })
            .min(6, { message: 'Password must be at least 6 characters' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    });

export const profileRegisterSchema = z.object({
    name: z.string().min(1, { message: 'Name must not be empty' }),
    gender: z.enum(['Male', 'Female']),
    birthday: z.date({
        message: 'Birthday must be a valid date',
    }),
    address: z.string().min(1, { message: 'Address must not be empty' }),
    phone: z.string().min(1, { message: 'Phone must not be empty' }),
});

export type ProfileFormValues = z.infer<typeof profileRegisterSchema>;

export const resetPasswordSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export type MutateVars = {
    email: string;
    password: string;
};
