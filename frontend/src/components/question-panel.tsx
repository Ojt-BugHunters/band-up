'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Question } from '@/lib/api/dto/question';
interface QuestionPanelProps {
    questions: Question[];
    answers: Record<number, string>;
    onAnswerChange: (questionId: number, answer: string) => void;
    passageTitle: string;
}

export default function QuestionPanel({
    questions,
    answers,
    onAnswerChange,
    passageTitle,
}: QuestionPanelProps) {
    const getQuestionTypeLabel = (type: string) => {
        switch (type) {
            case 'multiple-choice':
                return 'Multiple Choice';
            case 'short-answer':
                return 'Short Answer';
            case 'true-false':
                return 'True/False';
            case 'completion':
                return 'Completion';
            default:
                return type;
        }
    };

    const getQuestionTypeColor = (type: string) => {
        switch (type) {
            case 'multiple-choice':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'short-answer':
                return 'bg-success/10 text-success border-success/20';
            case 'true-false':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'completion':
                return 'bg-accent/10 text-accent-foreground border-accent/20';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const renderQuestion = (question: Question) => {
        const isAnswered =
            answers[question.id] && answers[question.id].trim() !== '';

        return (
            <div
                key={question.id}
                className="border-border bg-card/50 space-y-3 rounded-lg border p-4"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                Q{question.id}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={`text-xs ${getQuestionTypeColor(question.type)}`}
                            >
                                {getQuestionTypeLabel(question.type)}
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
                        <p className="text-sm leading-relaxed text-pretty">
                            {question.question}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    {question.type === 'multiple-choice' &&
                        question.options && (
                            <RadioGroup
                                value={answers[question.id] || ''}
                                onValueChange={(value) =>
                                    onAnswerChange(question.id, value)
                                }
                            >
                                {question.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2"
                                    >
                                        <RadioGroupItem
                                            value={option}
                                            id={`q${question.id}-${index}`}
                                        />
                                        <Label
                                            htmlFor={`q${question.id}-${index}`}
                                            className="cursor-pointer text-sm"
                                        >
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}

                    {question.type === 'true-false' && (
                        <RadioGroup
                            value={answers[question.id] || ''}
                            onValueChange={(value) =>
                                onAnswerChange(question.id, value)
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="True"
                                    id={`q${question.id}-true`}
                                />
                                <Label
                                    htmlFor={`q${question.id}-true`}
                                    className="cursor-pointer text-sm"
                                >
                                    True
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="False"
                                    id={`q${question.id}-false`}
                                />
                                <Label
                                    htmlFor={`q${question.id}-false`}
                                    className="cursor-pointer text-sm"
                                >
                                    False
                                </Label>
                            </div>
                        </RadioGroup>
                    )}

                    {(question.type === 'short-answer' ||
                        question.type === 'completion') && (
                        <Input
                            placeholder={
                                question.type === 'completion'
                                    ? 'Fill in the blank...'
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
                <ScrollArea className="custom-scrollbar h-full">
                    <div className="space-y-4 p-6">
                        {questions.map(renderQuestion)}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
