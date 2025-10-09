'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
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

const formSchema = z.object({
    otp: z.string().min(6, {
        message: 'Please enter the complete 6-digit code.',
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function OtpVerificationForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            otp: '',
        },
    });

    function onSubmit(values: FormValues) {
        console.log(values);
    }

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
                                    // disabled={mutation.isPending}
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
                            <FormDescription className="text-center">
                                Enter the 6-digit code sent to your email
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <Button
                    type="submit"
                    className="h-12 w-full text-base font-medium"
                    disabled={
                        mutation.isPending || form.getValues('otp').length !== 6
                    }
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
                </Button> */}
            </form>
        </Form>
    );
}

export default function ForgetPassword() {
    return (
        <div>
            <h1>Forget</h1>
        </div>
    );
}
