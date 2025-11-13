import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    ResetPasswordFormValues,
    useResetPassword,
} from '@/lib/service/account';
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const otp = searchParams.get('otp') ?? '';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { form, mutation } = useResetPassword(otp);

    const onSubmit = (data: ResetPasswordFormValues) => {
        mutation.mutate({
            email,
            password: data.password,
        });
    };

    if (mutation.isSuccess) {
        return (
            <Card>
                <CardHeader className="space-y-4 text-center">
                    <div className="bg-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                        <CheckCircle2 className="text-primary-foreground h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">
                            Password reset successful
                        </CardTitle>
                        <CardDescription className="text-balance">
                            Your password has been successfully reset. You can
                            now log in with your new password.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link href="/auth/login" className="block">
                        <Button className="w-full">Continue to login</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl">Reset password</CardTitle>
                <CardDescription className="text-balance">
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Enter new password"
                                                disabled={mutation.isPending}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm new password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                placeholder="Confirm new password"
                                                disabled={mutation.isPending}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {mutation.isError && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    {mutation.error instanceof Error
                                        ? mutation.error.message
                                        : 'Failed to reset password. Please try again.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? 'Resetting...'
                                    : 'Reset password'}
                            </Button>

                            <Link href="/auth/login" className="block">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    disabled={mutation.isPending}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to login
                                </Button>
                            </Link>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
