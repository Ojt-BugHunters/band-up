'use client';

import { useState } from 'react';
import { TestStartDialog } from '@/components/test-start-dialog';
import { TestInterface } from '@/components/test-interface';

// Sample questions - replace with your actual data
const sampleQuestions = [
    {
        id: '1',
        question: 'Thủ đô của Việt Nam là gì?',
        correctAnswer: 'Hà Nội',
        options: ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Huế'],
    },
    {
        id: '2',
        question: 'Ai là tác giả của "Truyện Kiều"?',
        correctAnswer: 'Nguyễn Du',
        options: ['Nguyễn Du', 'Hồ Xuân Hương', 'Nguyễn Trãi', 'Tố Hữu'],
    },
    {
        id: '3',
        question: 'Việt Nam có bao nhiêu tỉnh thành?',
        correctAnswer: '63',
        options: ['60', '61', '62', '63'],
    },
    {
        id: '4',
        question: 'Ngày Quốc khánh Việt Nam là ngày nào?',
        correctAnswer: '2/9',
        options: ['30/4', '2/9', '19/5', '1/1'],
    },
    {
        id: '5',
        question: 'Đơn vị tiền tệ của Việt Nam là gì?',
        correctAnswer: 'Đồng',
        options: ['Đồng', 'Đô la', 'Bảng', 'Euro'],
    },
];

export default function TestPage() {
    const [hasStarted, setHasStarted] = useState(false);

    const handleStart = () => {
        setHasStarted(true);
    };

    const handleComplete = () => {
        setHasStarted(false);
    };

    return (
        <div className="bg-background min-h-screen">
            {!hasStarted && (
                <TestStartDialog
                    onStart={handleStart}
                    questionCount={sampleQuestions.length}
                />
            )}
            {hasStarted && (
                <TestInterface
                    questions={sampleQuestions}
                    onComplete={handleComplete}
                    title="Kiến thức Việt Nam"
                />
            )}
        </div>
    );
}
