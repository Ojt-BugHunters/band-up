'use client';

import type React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    Mic,
    MicOff,
    FileText,
    Play,
    Square,
    Upload,
    Info,
} from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { speakingTestParts } from '../../constants/sample-data';
import { enrichSpeakingTestParts } from '@/lib/api/dto/question';
import { VoiceInput } from './voice-input';

type SpeakingTestProps = {
    mode?: string;
    sections?: string[];
};

export function SpeakingTest({
    mode = 'full',
    sections = [],
}: SpeakingTestProps) {
    const enrichedSpeakingTestParts =
        enrichSpeakingTestParts(speakingTestParts);
    const availableParts =
        mode === 'full'
            ? enrichedSpeakingTestParts
            : enrichedSpeakingTestParts.filter((part) =>
                  sections.includes(part.id),
              );

    const [currentPart, setCurrentPart] = useState(availableParts[0]?.id ?? '');
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [preparationTime, setPreparationTime] = useState(0);
    const [speakingTime, setSpeakingTime] = useState(0);
    const [partAnswers, setPartAnswers] = useState<Record<string, string>>({});
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [showReview, setShowReview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const [recording, setRecording] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const totalDuration = availableParts.reduce(
        (total, part) => total + part.duration,
        0,
    );
    const [timeRemaining, setTimeRemaining] = useState(totalDuration);

    const currentPartData = availableParts.find((p) => p.id === currentPart);

    useEffect(() => {
        if (!isTestStarted) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsTestStarted(false);
                    setIsRecording(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTestStarted]);

    useEffect(() => {
        if (!isPreparing && !isRecording) return;

        const timer = setInterval(() => {
            if (isPreparing) {
                setPreparationTime((prev) => {
                    if (prev <= 1) {
                        setIsPreparing(false);
                        setPreparationTime(0);
                        if (currentPartData?.duration) {
                            setSpeakingTime(currentPartData.duration);
                            setIsRecording(true);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            } else if (isRecording) {
                setSpeakingTime((prev) => {
                    if (prev <= 1) {
                        setIsRecording(false);
                        setSpeakingTime(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isPreparing, isRecording, currentPartData]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const file = new File([blob], `recording-${Date.now()}.webm`, {
                type: 'audio/webm',
            });
            setPartAnswers((prev) => ({ ...prev, [currentPart]: file.name }));
            setAudioUrl(URL.createObjectURL(blob));
        };

        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const allowedTypes = [
                'audio/mp3',
                'audio/wav',
                'audio/m4a',
                'audio/ogg',
                'audio/webm',
            ];
            if (
                allowedTypes.includes(file.type) ||
                file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)
            ) {
                setUploadedFile(file);
                setPartAnswers((prev) => ({
                    ...prev,
                    [currentPart]: `uploaded: ${file.name}`,
                }));
                setShowFileUpload(false);
            } else {
                alert(
                    'Please upload an audio file (MP3, WAV, M4A, OGG, or WebM)',
                );
            }
        }
    };

    const handleStartRecording = () => {
        if (!currentPartData) return;

        setPartAnswers((prev) => ({ ...prev, [currentPart]: 'attempted' }));
        if (currentPart === 'section-2') {
            setPreparationTime(60);
            setIsPreparing(true);
        } else {
            setSpeakingTime(currentPartData.duration);
            setIsRecording(true);
        }
    };

    const handleStartWithFile = () => {
        if (!currentPartData) return;
        setShowFileUpload(true);
    };

    const handleReviewQuestions = () => {
        setShowReview(!showReview);
    };

    const handleStopRecording = () => {
        setIsPreparing(false);
        setIsRecording(false);
        setPreparationTime(0);
        setSpeakingTime(0);
    };

    const handleNextPart = () => {
        const currentPartIndex = availableParts.findIndex(
            (p) => p.id === currentPart,
        );
        if (currentPartIndex < availableParts.length - 1) {
            setCurrentPart(availableParts[currentPartIndex + 1].id);
        }
    };

    const handlePreviousPart = () => {
        const currentPartIndex = availableParts.findIndex(
            (p) => p.id === currentPart,
        );
        if (currentPartIndex > 0) {
            setCurrentPart(availableParts[currentPartIndex - 1].id);
        }
    };

    const getTotalParts = () => {
        return availableParts.length;
    };

    const getAnsweredParts = () => {
        return Object.keys(partAnswers).length;
    };

    const getUnansweredQuestions = () => {
        const unansweredParts = availableParts.filter(
            (part) => !partAnswers[part.id],
        );
        return unansweredParts.map((part, index) => ({
            id: index + 1,
            type: 'speaking-part',
            question: part.title,
        }));
    };

    if (availableParts.length === 0) {
        return <div>No speaking test parts available</div>;
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="border-border bg-card border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Mic className="text-primary h-6 w-6" />
                                <h1 className="text-xl font-semibold text-balance">
                                    IELTS Speaking Test
                                </h1>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                Academic Module
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono text-lg">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>

                            <ProgressDialog
                                totalQuestions={getTotalParts()}
                                answeredQuestions={getAnsweredParts()}
                                unansweredQuestions={getUnansweredQuestions()}
                            />

                            {!isTestStarted ? (
                                <Button
                                    onClick={() => setIsTestStarted(true)}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    Start Test
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsTestStarted(false)}
                                >
                                    End Test
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-balance">
                                    Test Parts
                                </CardTitle>
                                <Separator />
                            </CardHeader>

                            <CardContent className="h-[calc(100%-120px)] p-0">
                                <ScrollArea className="h-full">
                                    <div className="space-y-3 p-6">
                                        {availableParts.map((part, index) => (
                                            <div
                                                key={part.id}
                                                className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                                                    currentPart === part.id
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:bg-muted/50'
                                                }`}
                                                onClick={() => {
                                                    setCurrentPart(part.id);
                                                }}
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        Part{' '}
                                                        {part.id
                                                            .split('-')
                                                            .pop()}
                                                    </Badge>
                                                    <div className="flex items-center gap-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {formatTime(
                                                                part.duration,
                                                            )}
                                                        </Badge>
                                                        {partAnswers[
                                                            part.id
                                                        ] && (
                                                            <Badge
                                                                variant="default"
                                                                className="bg-green-500 text-xs"
                                                            >
                                                                ✓
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <h3 className="mb-2 text-sm font-medium text-balance">
                                                    {part.title}
                                                </h3>
                                                <p className="text-muted-foreground text-xs text-pretty">
                                                    {part.description}
                                                </p>
                                                <div className="border-border/50 mt-2 border-t pt-2">
                                                    <span className="text-muted-foreground text-xs">
                                                        {part.questions.length}{' '}
                                                        questions
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        {currentPartData?.title}
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {currentPartData?.questions.length}{' '}
                                        Questions
                                    </Badge>
                                </div>
                                <Separator />
                            </CardHeader>

                            <CardContent className="flex h-[calc(100%-120px)] flex-col">
                                {currentPartData && (
                                    <div className="h-100 flex-1 space-y-6">
                                        <ScrollArea className="h-100 flex-1">
                                            <div className="space-y-4 pr-4">
                                                {currentPartData.questions.map(
                                                    (question, index) => (
                                                        <div
                                                            key={question.id}
                                                            className="bg-card/50 rounded-lg border p-6"
                                                        >
                                                            <div className="mb-4 flex items-center gap-2">
                                                                <FileText className="text-primary h-5 w-5" />
                                                                <span className="font-medium">
                                                                    Question{' '}
                                                                    {index + 1}
                                                                </span>
                                                                {question.preparationTime >
                                                                    0 && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="ml-auto text-xs"
                                                                    >
                                                                        Prep:{' '}
                                                                        {formatTime(
                                                                            question.preparationTime,
                                                                        )}
                                                                    </Badge>
                                                                )}
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    Speak:{' '}
                                                                    {formatTime(
                                                                        question.speakingTime,
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-lg leading-relaxed text-pretty whitespace-pre-line">
                                                                {
                                                                    question.question
                                                                }
                                                            </p>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </ScrollArea>

                                        <div className="space-y-4">
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertDescription>
                                                    <div className="space-y-2">
                                                        <p className="font-medium">
                                                            Recording
                                                            Instructions:
                                                        </p>
                                                        <ul className="ml-4 list-disc space-y-1 text-sm">
                                                            <li>
                                                                Answer ALL
                                                                questions above
                                                                in ONE
                                                                continuous
                                                                recording
                                                            </li>
                                                            <li>
                                                                Take your time
                                                                to think about
                                                                each question
                                                                before answering
                                                            </li>
                                                            <li>
                                                                Speak clearly
                                                                and at a natural
                                                                pace
                                                            </li>
                                                            {currentPart ===
                                                                'part-2' && (
                                                                <li>
                                                                    You will
                                                                    have 1
                                                                    minute to
                                                                    prepare
                                                                    before
                                                                    recording
                                                                    starts
                                                                </li>
                                                            )}
                                                            <li>
                                                                Total
                                                                recommended
                                                                time:{' '}
                                                                {currentPartData
                                                                    ? formatTime(
                                                                          currentPartData.duration,
                                                                      )
                                                                    : 'N/A'}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>

                                            {showFileUpload && (
                                                <Alert>
                                                    <Info className="h-4 w-4" />
                                                    <AlertDescription>
                                                        <div className="space-y-3">
                                                            <p className="font-medium">
                                                                File Upload
                                                                Instructions:
                                                            </p>
                                                            <ul className="ml-4 list-disc space-y-1 text-sm">
                                                                <li>
                                                                    Upload your
                                                                    audio
                                                                    recording
                                                                    answering
                                                                    ALL
                                                                    questions in
                                                                    this part
                                                                </li>
                                                                <li>
                                                                    Accepted
                                                                    formats:
                                                                    MP3, WAV,
                                                                    M4A, OGG,
                                                                    WebM
                                                                </li>
                                                                <li>
                                                                    Maximum file
                                                                    size: 50MB
                                                                </li>
                                                                <li>
                                                                    Ensure your
                                                                    recording
                                                                    covers all
                                                                    questions
                                                                    above
                                                                </li>
                                                                <li>
                                                                    Recommended
                                                                    duration:{' '}
                                                                    {currentPartData
                                                                        ? formatTime(
                                                                              currentPartData.duration,
                                                                          )
                                                                        : 'N/A'}
                                                                </li>
                                                            </ul>
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <Input
                                                                    ref={
                                                                        fileInputRef
                                                                    }
                                                                    type="file"
                                                                    accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                                                                    onChange={
                                                                        handleFileUpload
                                                                    }
                                                                    className="flex-1"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        setShowFileUpload(
                                                                            false,
                                                                        )
                                                                    }
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                            {uploadedFile && (
                                                                <p className="text-sm text-green-600">
                                                                    ✓ File
                                                                    uploaded:{' '}
                                                                    {
                                                                        uploadedFile.name
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {(isRecording || isPreparing) && (
                                                <Alert className="border-blue-200 bg-blue-50">
                                                    <Info className="h-4 w-4 text-blue-600" />
                                                    <AlertDescription>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="font-medium text-blue-800">
                                                                    {isPreparing
                                                                        ? 'Preparation Phase'
                                                                        : 'Recording in Progress'}
                                                                </p>
                                                                <p className="text-sm text-blue-700">
                                                                    {isPreparing
                                                                        ? 'Use this time to organize your thoughts for all questions'
                                                                        : 'Answer all questions above in your recording'}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={
                                                                    handleReviewQuestions
                                                                }
                                                                className="ml-4 bg-transparent"
                                                            >
                                                                {showReview
                                                                    ? 'Hide Questions'
                                                                    : 'Review Questions'}
                                                            </Button>
                                                        </div>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {showReview &&
                                                (isRecording ||
                                                    isPreparing) && (
                                                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                                        <h4 className="mb-3 font-medium text-yellow-800">
                                                            Quick Review -
                                                            Answer These
                                                            Questions:
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {currentPartData?.questions.map(
                                                                (
                                                                    question,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            question.id
                                                                        }
                                                                        className="text-sm"
                                                                    >
                                                                        <span className="font-medium text-yellow-700">
                                                                            Q
                                                                            {index +
                                                                                1}
                                                                            :
                                                                        </span>
                                                                        <span className="ml-2 text-yellow-800">
                                                                            {
                                                                                question.question.split(
                                                                                    '\n',
                                                                                )[0]
                                                                            }
                                                                            {question.question.includes(
                                                                                '\n',
                                                                            ) &&
                                                                                '...'}
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                        </div>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex flex-col items-center gap-4">
                                                <VoiceInput
                                                    onStart={() => {
                                                        setPartAnswers(
                                                            (prev) => ({
                                                                ...prev,
                                                                [currentPart]:
                                                                    'attempted',
                                                            }),
                                                        );
                                                    }}
                                                    onStop={(
                                                        file,
                                                        duration,
                                                    ) => {
                                                        setPartAnswers(
                                                            (prev) => ({
                                                                ...prev,
                                                                [currentPart]:
                                                                    file.name,
                                                            }),
                                                        );
                                                        console.log(
                                                            'Recorded file:',
                                                            file,
                                                            'Duration:',
                                                            duration,
                                                        );
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between border-t pt-4">
                                                <Button
                                                    variant="outline"
                                                    onClick={handlePreviousPart}
                                                    disabled={
                                                        currentPart ===
                                                        availableParts[0].id
                                                    }
                                                >
                                                    Previous Part
                                                </Button>

                                                {audioUrl && (
                                                    <div className="mt-4">
                                                        <p className="mb-1 text-sm text-green-600">
                                                            Preview your
                                                            recording:
                                                        </p>
                                                        <audio
                                                            controls
                                                            src={audioUrl}
                                                            className="w-full"
                                                        />
                                                    </div>
                                                )}

                                                <Button
                                                    variant="outline"
                                                    onClick={handleNextPart}
                                                    disabled={
                                                        currentPart ===
                                                        availableParts[
                                                            availableParts.length -
                                                                1
                                                        ].id
                                                    }
                                                >
                                                    Next Part
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
