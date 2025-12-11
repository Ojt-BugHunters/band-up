'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Download,
    Printer,
    Share2,
    Linkedin,
    Target,
    RotateCcw,
} from 'lucide-react';
import { useUser } from '@/lib/service/account';
import { toPng } from 'html-to-image';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { clearTestLocalStorage } from '@/lib/utils';

interface CertificateTabProps {
    testData: { testId: string };
    bandScore: number;
    totalScore: number;
    percentage: number;
}

export default function CertificateTab({
    testData,
    bandScore,
    percentage,
}: CertificateTabProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const [quitDialogOpen, setQuitDialogOpen] = useState(false);
    const [quitLoading, setQuitLoading] = useState(false);

    const user = useUser();
    const router = useRouter();

    const downloadCertificate = async () => {
        if (!certificateRef.current) return;

        setIsDownloading(true);
        try {
            const dataUrl = await toPng(certificateRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                skipFonts: true,
            });

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `BandUp-IELTS-Certificate-${testData.testId}.png`;
            link.click();
        } catch (error) {
            console.error('Error downloading certificate:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const getScoreMessage = (score: number) => {
        if (score >= 8) return 'Outstanding Achievement';
        if (score >= 7) return 'Excellent Performance';
        if (score >= 6) return 'Solid Achievement';
        if (score >= 5) return 'Good Effort';
        return 'Keep Practicing';
    };

    // Hàm xử lý Quit
    const handleQuitConfirm = async () => {
        try {
            setQuitLoading(true);
            clearTestLocalStorage(); // Dọn dẹp storage
            router.push('/test');
        } finally {
            setQuitLoading(false);
            setQuitDialogOpen(false);
        }
    };

    // Hàm xử lý Retake
    const handleRetake = () => {
        clearTestLocalStorage(); // Dọn dẹp storage để làm bài mới
        router.push('/test');
    };

    return (
        <div className="space-y-6">
            <div className="relative">
                <div
                    ref={certificateRef}
                    className="overflow-hidden rounded-2xl bg-white text-center shadow-2xl"
                    style={{ fontFamily: 'Inter, Arial, sans-serif' }}
                >
                    <div className="relative overflow-hidden px-8 py-12 md:px-12 md:py-16">
                        <div className="absolute top-0 left-0 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
                        <div className="absolute right-0 bottom-0 h-40 w-40 translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tl from-blue-500/10 to-purple-500/10" />

                        <div className="relative z-10">
                            <div className="mb-8">
                                <p className="mb-2 text-sm font-semibold tracking-widest text-gray-500 uppercase">
                                    Certificate of Achievement
                                </p>
                                <h2 className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent">
                                    BandUp IELTS
                                </h2>
                                <div className="mx-auto h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500" />
                            </div>

                            <p className="mb-8 text-lg text-gray-600">
                                This is to certify that
                            </p>

                            <div className="mb-8">
                                <p className="mb-1 text-3xl font-bold text-gray-900">
                                    {user?.name}
                                </p>
                                <p className="text-gray-500">
                                    has successfully completed the IELTS Test
                                </p>
                            </div>

                            <div className="mb-8 space-y-6">
                                <p className="text-lg text-gray-600">
                                    with an outstanding performance achieving a
                                </p>

                                <div className="flex items-center justify-center gap-8">
                                    <div className="text-center">
                                        <div className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
                                            {bandScore.toFixed(1)}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Band Score
                                        </p>
                                    </div>
                                    <div className="text-3xl text-gray-300">
                                        /
                                    </div>
                                    <div className="text-center">
                                        <div className="mb-2 text-4xl font-bold text-gray-900">
                                            {percentage}%
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">
                                            Accuracy
                                        </p>
                                    </div>
                                </div>

                                <p className="text-lg font-semibold text-gray-900">
                                    {getScoreMessage(bandScore)}
                                </p>
                            </div>

                            <div className="mb-8 text-sm text-gray-600">
                                <p>
                                    Date:{' '}
                                    {new Date().toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div className="border-t border-gray-300 pt-6">
                                <p className="mb-2 font-semibold text-gray-700">
                                    Keep up the excellent work!
                                </p>
                                <p className="text-sm text-gray-500">
                                    Your dedication and hard work are paying
                                    off.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 shadow-lg">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="text-center">
                            <h3 className="text-foreground mb-2 text-lg font-semibold">
                                Download Your Certificate
                            </h3>
                            <p className="text-muted-foreground">
                                Save and share your achievement with others
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={downloadCertificate}
                                disabled={isDownloading}
                                className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-blue-600 hover:to-purple-600"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading
                                    ? 'Downloading...'
                                    : 'Download PNG'}
                            </Button>
                            <Button
                                variant="outline"
                                className="border-border/50 hover:bg-muted/50 flex-1 gap-2 border-2 bg-transparent"
                                onClick={() => {
                                    if (certificateRef.current) {
                                        const printWindow = window.open(
                                            '',
                                            '',
                                            'width=800,height=600',
                                        );
                                        if (printWindow) {
                                            printWindow.document.write(
                                                certificateRef.current
                                                    .innerHTML,
                                            );
                                            printWindow.document.close();
                                            printWindow.print();
                                        }
                                    }
                                }}
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h4 className="text-foreground flex items-center gap-2 font-semibold">
                            <Target className="h-5 w-5 text-blue-600" />
                            Next Steps:
                        </h4>
                        <div className="space-y-3">
                            <div className="bg-muted/50 hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors">
                                <Share2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-600" />
                                <div>
                                    <p className="text-foreground text-sm font-medium">
                                        Share your achievement
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Post your certificate on social media
                                    </p>
                                </div>
                            </div>
                            <div className="bg-muted/50 hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors">
                                <Linkedin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                <div>
                                    <p className="text-foreground text-sm font-medium">
                                        Update LinkedIn profile
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Add your IELTS certificate to your
                                        profile
                                    </p>
                                </div>
                            </div>
                            <div className="bg-muted/50 hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors">
                                <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                                <div>
                                    <p className="text-foreground text-sm font-medium">
                                        Keep practicing
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        Retake the test to improve further
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-3 pt-4">
                <Button
                    variant="outline"
                    className="border-border/50 hover:bg-muted/50 flex-1 gap-2 border-2 bg-transparent"
                    onClick={() => setQuitDialogOpen(true)}
                >
                    Quit test
                </Button>

                <Button
                    className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:from-blue-600 hover:to-purple-600"
                    onClick={handleRetake}
                >
                    <RotateCcw className="h-4 w-4" />
                    Try again
                </Button>
            </div>
            <ConfirmDialog
                open={quitDialogOpen}
                onOpenChange={setQuitDialogOpen}
                title="Quit the test ?"
                description="If you quit, you just can view your result in the history tab"
                confirmText="Confirm"
                cancelText="Cancel"
                destructive
                loading={quitLoading}
                onConfirm={handleQuitConfirm}
            />
        </div>
    );
}
