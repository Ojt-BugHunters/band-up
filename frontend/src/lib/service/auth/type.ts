import z from 'zod';

export const otpSchema = z.object({
    otp: z
        .string()
        .length(6, { message: 'Enter the 6-digit otp code' })
        .regex(/^\d{6}$/, { message: 'OTP must be 6 digits' }),
});

export type VerifyOtpVars = { email: string; otp: string };

export type OtpFormValues = z.infer<typeof otpSchema>;
