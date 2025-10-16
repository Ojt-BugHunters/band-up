'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClipboardList } from 'lucide-react';

interface TestStartDialogProps {
    onStart: () => void;
    questionCount: number;
}

export function TestStartDialog({
    onStart,
    questionCount,
}: TestStartDialogProps) {
    return (
        <Dialog open={true}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-4">
                    <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                        <ClipboardList className="text-primary h-8 w-8" />
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">
                        Bắt đầu làm bài trắc nghiệm
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Bài kiểm tra có{' '}
                        <span className="text-foreground font-semibold">
                            {questionCount} câu hỏi
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-muted/50 rounded-lg border p-4">
                        <ul className="text-muted-foreground space-y-2 text-sm">
                            <li>• Chọn đáp án cho mỗi câu hỏi</li>
                            <li>• Không có phản hồi ngay lập tức</li>
                            <li>• Nhấn Nộp Bài khi hoàn thành</li>
                            <li>• Xem kết quả sau khi nộp bài</li>
                        </ul>
                    </div>

                    <Button onClick={onStart} className="w-full" size="lg">
                        Bắt đầu làm bài
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
