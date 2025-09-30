'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { TestTypeSelection } from '@/components/test-type-selection';

export default function CreateTestPage() {
    const router = useRouter();

    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="mx-auto max-w-6xl">
                <header className="relative top-20 mb-10">
                    <div className="container mx-auto px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/test')}
                                    className="hover:bg-muted/50 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300"
                                >
                                    <BookOpen className="h-5 w-5" />
                                    <span className="text-base font-medium">
                                        Back to test
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="container mx-auto p-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-600">
                            <TestTypeSelection />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
