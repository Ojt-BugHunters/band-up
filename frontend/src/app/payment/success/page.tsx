import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'Payment successful | BandUp',
};

type PaymentSuccessPageProps = {
    searchParams?: {
        plan?: string;
        amount?: string;
        currency?: string;
        reference?: string;
        ref?: string;
        email?: string;
    };
};

const formatAmount = (amount: string | undefined, currency: string): string => {
    if (!amount) return '—';

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) {
        return `${amount} ${currency}`;
    }

    try {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency,
        }).format(numericAmount);
    } catch {
        return `${numericAmount.toLocaleString('vi-VN')} ${currency}`;
    }
};

export default function PaymentSuccessPage({
    searchParams,
}: PaymentSuccessPageProps) {
    const plan = searchParams?.plan ?? 'IELTS Premium';
    const currency = (searchParams?.currency ?? 'VND').toUpperCase();
    const total = formatAmount(searchParams?.amount, currency);
    const reference =
        searchParams?.reference ?? searchParams?.ref ?? 'Processing reference';
    const email = searchParams?.email ?? 'Your email inbox';

    return (
        <div className="bg-muted flex min-h-svh items-center justify-center px-4 py-10">
            <div className="bg-background relative w-full max-w-4xl overflow-hidden rounded-3xl border shadow-lg">
                <div className="absolute inset-x-0 -top-10 h-28 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-20 blur-3xl" />

                <div className="relative grid gap-8 p-8 md:grid-cols-[1.5fr_1fr] md:p-12">
                    <section className="space-y-6">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="bg-success/10 text-success mx-auto flex h-16 w-16 items-center justify-center rounded-full md:mx-0">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                    Payment Successful
                                </p>
                                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    Thank you for upgrading 🚀
                                </h1>
                                <p className="text-muted-foreground text-base">
                                    Your subscription is now active. We just
                                    sent the receipt and activation guide to{' '}
                                    <span className="text-foreground font-medium">
                                        {email}
                                    </span>
                                    . You can start exploring every premium
                                    feature immediately.
                                </p>
                            </div>
                        </div>

                        <div className="bg-muted/50 space-y-4 rounded-2xl border p-6">
                            <div className="flex items-start gap-3">
                                <Sparkles className="text-primary mt-1 h-5 w-5" />
                                <div className="space-y-1">
                                    <p className="font-medium">
                                        What happens next?
                                    </p>
                                    <ul className="text-muted-foreground space-y-1 text-sm">
                                        <li>
                                            • Access unlimited speaking &
                                            writing mock tests.
                                        </li>
                                        <li>
                                            • Unlock full flashcards, dictation,
                                            and study rooms.
                                        </li>
                                        <li>
                                            • Receive tailored study updates
                                            directly in your inbox.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <Link href="/test" className="flex-1">
                                <Button className="w-full" size="lg">
                                    Start practicing now
                                </Button>
                            </Link>
                        </div>
                    </section>

                    <aside className="bg-card/60 space-y-6 rounded-2xl border p-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-sm">
                                    Order summary
                                </p>
                                <p className="font-semibold">
                                    {reference.slice(0, 24)}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Plan
                                </span>
                                <span className="font-medium">{plan}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Total paid
                                </span>
                                <span className="text-lg font-semibold">
                                    {total}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                    Reference
                                </span>
                                <span className="font-mono text-xs uppercase">
                                    {reference}
                                </span>
                            </div>
                        </div>

                        <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
                            Need support? Reply to the confirmation email or
                            chat with us in the Help Center anytime.
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
