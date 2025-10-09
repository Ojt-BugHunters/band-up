'use client';

import { Loader2, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import { OtpFormValues } from '@/hooks/use-verify-otp';
import { useVerifyOtp } from '@/hooks/use-verify-otp';
import { useForgetPassword } from '@/hooks/use-forget-password';

export function OtpVerificationForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('variables') ?? '';
    const { form, mutation } = useVerifyOtp();

    const onSubmit = (values: OtpFormValues) => {
        if (!email) {
            toast.error(
                'Missing email. Please go back and enter your email again.',
            );
            return;
        }
        mutation.mutate({ email, otp: values.otp });
    };

    const disabled =
        mutation.isPending || (form.watch('otp')?.length ?? 0) !== 6;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center space-y-4">
                            <FormLabel className="text-foreground text-base font-medium">
                                Verification Code
                            </FormLabel>
                            <FormControl>
                                <InputOTP
                                    maxLength={6}
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={mutation.isPending}
                                    className="gap-3"
                                >
                                    <InputOTPGroup className="gap-3">
                                        {[0, 1, 2, 3, 4, 5].map((i) => (
                                            <InputOTPSlot
                                                key={i}
                                                index={i}
                                                className="border-border bg-background text-foreground focus-visible:ring-ring focus-visible:ring-offset-background h-14 w-12 rounded-md border text-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="h-12 w-full text-base font-medium"
                    disabled={disabled}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                        </>
                    ) : mutation.isSuccess ? (
                        <>
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Verified
                        </>
                    ) : (
                        'Verify Code'
                    )}
                </Button>
            </form>
        </Form>
    );
}

export default function ForgetPassword() {
    const searchParams = useSearchParams();
    const email = searchParams.get('variables') ?? '';
    const resend = useForgetPassword();

    const handleResend = () => {
        if (!email) {
            toast.error(
                'Missing email. Please go back and enter your email again.',
            );
            return;
        }
        resend.mutate(email);
    };

    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 rounded-full p-4">
                            <Shield className="text-primary h-8 w-8" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-foreground text-3xl font-bold tracking-tight text-balance">
                            Verify your identity
                        </h1>
                        <p className="text-foreground/80 leading-relaxed text-pretty">
                            We have sent a 6-digit verification code to your
                            email. Enter it below to continue.
                        </p>
                    </div>
                </div>

                <OtpVerificationForm />

                <div className="space-y-4 text-center">
                    <p className="text-foreground/80 text-sm">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!email || resend.isPending}
                            className="text-primary hover:text-primary/80 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            aria-disabled={!email || resend.isPending}
                        >
                            {resend.isPending ? 'Sending…' : 'Resend code'}
                        </button>
                    </p>
                    <p className="text-foreground/70 text-xs">
                        This code will expire in 10 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
