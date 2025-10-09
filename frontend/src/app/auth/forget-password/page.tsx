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

    const disabled = mutation.isPending || form.watch('otp').length !== 6;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem className="flex flex-col items-center space-y-4">
                            <FormLabel className="text-base font-medium">
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
                                        <InputOTPSlot
                                            index={0}
                                            className="h-14 w-12 text-lg"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            className="h-14 w-12 text-lg"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            className="h-14 w-12 text-lg"
                                        />
                                        <InputOTPSlot
                                            index={3}
                                            className="h-14 w-12 text-lg"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            className="h-14 w-12 text-lg"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            className="h-14 w-12 text-lg"
                                        />
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
    return (
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="bg-accent/10 rounded-full p-4">
                            <Shield className="text-accent h-8 w-8" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-balance">
                            Verify your identity
                        </h1>
                        <p className="text-muted-foreground leading-relaxed text-pretty">
                            We have sent a 6-digit verification code to your
                            email. Enter it below to continue.
                        </p>
                    </div>
                </div>

                <OtpVerificationForm />

                <div className="space-y-4 text-center">
                    <p className="text-muted-foreground text-sm">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            className="text-accent hover:text-accent/80 font-medium transition-colors"
                        >
                            Resend code
                        </button>
                    </p>
                    <p className="text-muted-foreground text-xs">
                        This code will expire in 10 minutes
                    </p>
                </div>
            </div>
        </div>
    );
}
