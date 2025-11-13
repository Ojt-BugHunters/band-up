'use client';
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
import { OtpFormValues, useVerifyOtp, useVerifyUser } from '@/lib/service/auth';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function OtpVerificationForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const state = searchParams.get('state') ?? '';
    const { form, mutation } = useVerifyOtp();
    const { mutation: accountVerifyMutation } = useVerifyUser();

    const onSubmit = (values: OtpFormValues) => {
        if (!email) {
            toast.error(
                'Missing email. Please go back and enter your email again.',
            );
            return;
        }
        if (state === 'forget') {
            mutation.mutate({ email, otp: values.otp });
        } else {
            accountVerifyMutation.mutate({ email, otp: values.otp });
        }
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
