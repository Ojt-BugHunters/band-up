/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a
                        href="#"
                        className="flex items-center gap-2 font-extrabold"
                    >
                        <img src="/logo2.png" alt="Logo" className="size-8" />
                        BandUp
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <img
                    src="/registerimg.jpg"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover object-bottom dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    );
}

function LoginForm({ className, ...props }: React.ComponentProps<'form'>) {
    return (
        <form className={cn('flex flex-col gap-6', className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">
                    Start Your Journey with BandUp
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                    Become a Part of the BandUp Community
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="johndoe@example.com"
                        required
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Password"
                    />
                </div>
                <div className="grid gap-3">
                    <div className="flex items-center">
                        <Label htmlFor="confirmpassword">
                            Confirm Password
                        </Label>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Password"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Sign Up
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="bg-background text-muted-foreground relative z-10 px-2">
                        Or sign up with
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
            <div className="text-center text-sm">
                Already have an account?{' '}
                <a href="/auth/login" className="underline underline-offset-4">
                    Log in
                </a>
            </div>
        </form>
    );
}
