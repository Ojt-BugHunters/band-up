import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Payment canceled | BandUp',
    description:
        'Your BandUp payment was canceled. You can return to the dashboard or try the checkout again.',
};

export default function PaymentCancelPage() {
    return (
        <div className="bg-muted flex min-h-svh items-center justify-center px-4 py-10">
            <div className="bg-background relative w-full max-w-3xl overflow-hidden rounded-3xl border shadow-xl">
                <div className="absolute inset-x-0 -top-16 h-40 bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-500 opacity-30 blur-3xl" />

                <div className="relative grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
                    <section className="space-y-6">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="bg-rose-100 text-rose-600 mx-auto flex h-16 w-16 items-center justify-center rounded-full md:mx-0">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">
                                    Payment canceled
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    No worries—your card was not charged
                                </h1>
                                <p className="text-muted-foreground">
                                    The transaction was canceled, so your
                                    subscription remains unchanged. You can
                                    restart the checkout if you change your mind
                                    or head back to explore free lessons.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-2xl border bg-muted/40 p-6">
                            <h2 className="text-base font-semibold">
                                Need help?
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                If you canceled by mistake or ran into an issue,
                                reach out to us via support@bandup.com or the
                                in-app chat. We will keep your cart ready for
                                the next attempt.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <Link href="/" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to home
                                </Button>
                            </Link>
                        </div>
                    </section>

                    <aside className="space-y-4 rounded-2xl border bg-card/60 p-6 text-sm">
                        <div className="space-y-1">
                            <p className="text-muted-foreground text-xs uppercase tracking-widest">
                                Quick tips
                            </p>
                            <ul className="list-disc space-y-1 pl-4">
                                <li>
                                    Payment providers can hold funds for a few
                                    minutes; they release automatically.
                                </li>
                                <li>
                                    Make sure the email on your BandUp account
                                    matches the one on your payment method.
                                </li>
                                <li>
                                    Prefer bank transfer? Contact us for
                                    alternate checkout links.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
