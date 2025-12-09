'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { IELTSFeedbackDisplay } from './ielts-writing-feedback';
import LiquidLoading from '@/components/ui/liquid-loader';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/service';

interface SubmittedAnswer {
    taskTitle: string;
    questionId: string;
    attemptSectionId: string;
    content: string;
}

export default function WritingResultPage() {
    const params = useParams();
    const [ids, setIds] = useState<string[]>([]);
    const [questionIds, setQuestionIds] = useState<string[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const rawId = params.id;

        if (rawId) {
            const idString = decodeURIComponent(rawId.toString());
            const idArray = idString.split(',');

            setIds(idArray);

            console.log('Mảng ID:', idArray);
        }
    }, [params]);

    useEffect(() => {
        const storedJson = localStorage.getItem('submitted_answers');

        if (storedJson) {
            try {
                const parsedData: SubmittedAnswer[] = JSON.parse(storedJson);
                if (Array.isArray(parsedData)) {
                    const qIds = parsedData.map((item) => item.questionId);
                    setQuestionIds(qIds);
                    console.log('Question IDs từ LocalStorage:', qIds);
                }
            } catch (error) {
                console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
            }
        }
    }, []);

    if (isLoading) {
        return (
            <div className="bg-background flex h-screen w-full items-center justify-center">
                <LiquidLoading />
            </div>
        );
    }

    if (hasError || results.length === 0) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-destructive text-xl font-bold">
                    Unable to load results
                </h2>
                <p className="text-muted-foreground">
                    Please try refreshing the page.
                </p>
            </div>
        );
    }

    return (
        <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-4xl font-bold tracking-tight">
                        IELTS Writing Feedback
                    </h1>
                    <p className="text-muted-foreground">
                        Detailed analysis of your writing performance
                    </p>
                </div>

                <IELTSFeedbackDisplay data={results} />
            </div>
        </div>
    );
}
