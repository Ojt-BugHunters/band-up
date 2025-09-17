/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

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
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="johndoe@example.com"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full cursor-pointer">
                            Sign up
                        </Button>
                    </div>
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
