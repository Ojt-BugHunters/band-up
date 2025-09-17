/* eslint-disable @next/next/no-img-element */
'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaFacebook, FaGoogle } from 'react-icons/fa';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { useRegisterForm } from '@/app/hooks/use-register-form';

export default function LoginPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { form, onSubmit } = useRegisterForm();

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <form>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <img src="/logo.png" alt="Logo" width={65} />
                        <h1 className="text-xl font-bold">
                            Start Your Journey with BandUp
                        </h1>
                        <div className="text-center text-sm">
                            Already have an account?{' '}
                            <a
                                href="/auth/login"
                                className="underline underline-offset-4"
                            >
                                Log in
                            </a>
                        </div>
                    </div>
                    <Form {...form}>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="grid gap-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            placeholder="johndoe@example.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="grid gap-3">
                                    <div className="flex items-center">
                                        <FormLabel htmlFor="password">
                                            Password
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                {...field}
                                                placeholder="Password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (prev) => !prev,
                                                    )
                                                }
                                                className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2"
                                                tabIndex={-1}
                                            >
                                                {showPassword ? (
                                                    <FiEyeOff className="h-5 w-5" />
                                                ) : (
                                                    <FiEye className="h-5 w-5" />
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
                            name="confirmPassword" // 👈 PHẢI khác với "password"
                            render={({ field }) => (
                                <FormItem className="grid gap-3">
                                    <div className="flex items-center">
                                        <FormLabel htmlFor="confirmpassword">
                                            Confirm Password
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                id="confirmpassword"
                                                type={
                                                    showConfirmPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                {...field}
                                                placeholder="Password"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) => !prev,
                                                    )
                                                }
                                                className="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2"
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? (
                                                    <FiEyeOff className="h-5 w-5" />
                                                ) : (
                                                    <FiEye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full cursor-pointer">
                            Sign Up
                        </Button>
                    </Form>

                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                        <span className="bg-background text-muted-foreground relative z-10 px-2">
                            Or continue with
                        </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full cursor-pointer"
                        >
                            <FaGoogle className="text-red-500" />
                            Google
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            className="w-full cursor-pointer"
                        >
                            <FaFacebook className="text-2xl text-blue-600" />
                            Facebook
                        </Button>
                    </div>
                </div>
            </form>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{' '}
                <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}
