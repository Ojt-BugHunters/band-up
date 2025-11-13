import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/lib/service/account';
import { useForgetPassword } from '@/lib/service/account';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export const LoginForm = ({
    className,
    ...props
}: React.ComponentProps<'div'>) => {
    const { form, mutation } = useLogin();
    const [showPassword, setShowPassword] = useState(false);
    const forgetPassword = useForgetPassword();

    const handleForgot = async () => {
        const validateEmail = await form.trigger('email');
        const email = form.getValues('email');

        if (!validateEmail || !email) {
            form.setError('email', { message: 'Please enter a valid email' });
            form.setFocus('email');
            return;
        }
        forgetPassword.mutate(email);
    };

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form
                            className="p-6 md:p-8"
                            onSubmit={form.handleSubmit((values) =>
                                mutation.mutate(values),
                            )}
                        >
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">
                                        Welcome back
                                    </h1>
                                    <p className="text-muted-foreground text-balance">
                                        Login to your BandUp account
                                    </p>
                                </div>
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
                                                <button
                                                    type="button"
                                                    onClick={handleForgot}
                                                    disabled={
                                                        forgetPassword.isPending
                                                    }
                                                    className="text-primary ml-auto text-sm underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {forgetPassword.isPending
                                                        ? 'Sending…'
                                                        : 'Forgot your password?'}
                                                </button>
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
                                <div className="flex items-center gap-3">
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms">Remember me</Label>
                                </div>
                                {mutation.status === 'pending' ? (
                                    <Button
                                        disabled
                                        className="w-full cursor-pointer"
                                    >
                                        <Loader2 className="animate-spin" />
                                        Loading
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        className="w-full cursor-pointer"
                                    >
                                        Login
                                    </Button>
                                )}

                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or continue with
                                    </span>
                                </div>
                                <div>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full cursor-pointer"
                                    >
                                        <FcGoogle />
                                        Google
                                    </Button>
                                </div>
                                <div className="text-center text-sm">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href="/auth/register"
                                        className="underline underline-offset-4"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>

                    <div className="bg-muted relative hidden md:block">
                        <Image
                            src="/loginimg.jpg"
                            alt="Image"
                            width={500}
                            height={500}
                            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{' '}
                <a href="#">Terms of Service</a> and{' '}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
};
