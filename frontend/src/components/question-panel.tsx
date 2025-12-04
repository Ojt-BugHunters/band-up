'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ReadingQuestion,
    ReadingQuestionType,
} from '@/lib/service/test/question';
import Image from 'next/image';
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';

interface QuestionPanelProps {
    questions: ReadingQuestion[];
    answers: Record<string, string>;
    onAnswerChange: (questionId: string, answer: string) => void;
    passageTitle: string;
}

const getQuestionTypeLabel = (type: ReadingQuestionType) => {
    switch (type) {
        case 'MC':
            return 'Multiple Choice';
        case 'SA':
            return 'Short Answer';
        case 'TF':
            return 'True/False/Not Given';
        case 'YN':
            return 'Yes/No/Not Given';
        case 'SC':
            return 'Sentence Completion';
        case 'MF':
            return 'Matching Features';
        case 'MI':
            return 'Matching Features';
        default:
            return type;
    }
};

const getQuestionTypeColor = (type: ReadingQuestionType) => {
    switch (type) {
        case 'MC':
            return 'bg-primary/10 text-primary border-primary/20';
        case 'SA':
        case 'SC':
        case 'MF':
            return 'bg-success/10 text-success border-success/20';
        case 'TF':
        case 'YN':
            return 'bg-warning/10 text-warning border-warning/20';
        default:
            return 'bg-muted text-muted-foreground';
    }
};

export default function QuestionPanel({
    questions,
    answers,
    onAnswerChange,
    passageTitle,
}: QuestionPanelProps) {
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    const renderQuestion = (question: ReadingQuestion) => {
        const isAnswered =
            answers[question.id] && answers[question.id].trim() !== '';
        const questionType = question.content.type;

        return (
            <div
                key={question.id}
                className="border-border bg-card/50 space-y-3 rounded-lg border p-4"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                Q{question.content.questionNumber}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-xs ${getQuestionTypeColor(questionType)}`}
                            >
                                {getQuestionTypeLabel(questionType)}
                            </Badge>
                            {isAnswered && (
                                <Badge
                                    variant="outline"
                                    className="bg-success/10 text-success border-success/20 text-xs"
                                >
                                    Answered
                                </Badge>
                            )}
                        </div>

                        {question.cloudfrontUrl && (
                            <div className="mb-4">
                                <div
                                    className="group relative cursor-pointer"
                                    onClick={() =>
                                        setZoomedImage(question.cloudfrontUrl!)
                                    }
                                >
                                    <Image
                                        src={question.cloudfrontUrl}
                                        alt={`Question ${question.content.questionNumber}`}
                                        width={350}
                                        height={250}
                                        className="border-border bg-background/50 w-full rounded-lg border object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                                        <ZoomIn className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {questionType === 'MC' && (
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onValueChange={(value) =>
                                onAnswerChange(question.id, value)
                            }
                        >
                            {['A', 'B', 'C', 'D'].map((option) => (
                                <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={`q${question.id}-${option}`}
                                    />
                                    <Label
                                        htmlFor={`q${question.id}-${option}`}
                                        className="cursor-pointer text-sm"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {questionType === 'TF' && (
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onValueChange={(value) =>
                                onAnswerChange(question.id, value)
                            }
                        >
                            {['TRUE', 'FALSE', 'NOT GIVEN'].map((option) => (
                                <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={`q${question.id}-${option}`}
                                    />
                                    <Label
                                        htmlFor={`q${question.id}-${option}`}
                                        className="cursor-pointer text-sm"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {questionType === 'YN' && (
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onValueChange={(value) =>
                                onAnswerChange(question.id, value)
                            }
                        >
                            {['YES', 'NO', 'NOT GIVEN'].map((option) => (
                                <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={`q${question.id}-${option}`}
                                    />
                                    <Label
                                        htmlFor={`q${question.id}-${option}`}
                                        className="cursor-pointer text-sm"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    )}

                    {(questionType === 'SA' ||
                        questionType === 'SC' ||
                        questionType === 'MF' ||
                        questionType === 'MI') && (
                        <Input
                            placeholder={
                                questionType === 'SC'
                                    ? 'Complete the sentence...'
                                    : questionType === 'MF'
                                      ? 'Match the feature...'
                                      : 'Type your answer...'
                            }
                            value={answers[question.id] || ''}
                            onChange={(e) =>
                                onAnswerChange(question.id, e.target.value)
                            }
                            className="text-sm"
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg text-balance">
                    Questions
                </CardTitle>
                <p className="text-muted-foreground text-sm text-pretty">
                    {passageTitle}
                </p>
                <Separator />
            </CardHeader>

            <CardContent className="h-[calc(100%-120px)] p-0">
                <ScrollArea className="custom-scrollbar h-200 overflow-scroll">
                    <div className="space-y-4 p-6">
                        {questions.map(renderQuestion)}
                    </div>
                </ScrollArea>
            </CardContent>

            <Dialog
                open={!!zoomedImage}
                onOpenChange={() => setZoomedImage(null)}
            >
                <DialogContent className="max-w-3xl border-none bg-transparent p-2 shadow-none">
                    {zoomedImage && (
                        <Image
                            src={zoomedImage}
                            alt="Zoomed Question"
                            width={800}
                            height={600}
                            className="h-auto w-full rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
