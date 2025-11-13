'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    Edit3,
    AlertTriangle,
    Check,
    Keyboard,
    VideoIcon as HideIcon,
    FileText,
    Menu,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { SectionsMenu } from './section-panel';
import {
    useGetDictationTest,
    useGetSectionQuestions,
} from '@/lib/service/dictation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { NotFound } from '@/components/not-found';
import { ModeSelectionDialog } from './mode-selection-dialog';
import { ShowShortcutDialog } from './show-shortcut-dialog';
import Link from 'next/link';
import { AudioPlayer } from './audio-player';

const mockDictationData = {
    id: '1',
    title: 'Cambridge IELTS 20 Test 1 Part 2',
    audioUrl: '/placeholder.mp3',
    duration: 480,
    sentences: [
        {
            id: 1,
            text: 'The museum is located in the city center',
            words: [
                'The',
                'museum',
                'is',
                'located',
                'in',
                'the',
                'city',
                'center',
            ],
            startTime: 0,
            endTime: 3,
        },
        {
            id: 2,
            text: 'It opens every day except Monday from nine to five',
            words: [
                'It',
                'opens',
                'every',
                'day',
                'except',
                'Monday',
                'from',
                'nine',
                'to',
                'five',
            ],
            startTime: 3,
            endTime: 7,
        },
        {
            id: 3,
            text: 'Admission is free for students with valid identification',
            words: [
                'Admission',
                'is',
                'free',
                'for',
                'students',
                'with',
                'valid',
                'identification',
            ],
            startTime: 7,
            endTime: 11,
        },
        {
            id: 4,
            text: 'The special exhibition will continue until the end of December',
            words: [
                'The',
                'special',
                'exhibition',
                'will',
                'continue',
                'until',
                'the',
                'end',
                'of',
                'December',
            ],
            startTime: 11,
            endTime: 15,
        },
        {
            id: 5,
            text: 'Guided tours are available in English French and Spanish',
            words: [
                'Guided',
                'tours',
                'are',
                'available',
                'in',
                'English',
                'French',
                'and',
                'Spanish',
            ],
            startTime: 15,
            endTime: 19,
        },
        {
            id: 6,
            text: 'Please note that photography is not permitted inside the gallery',
            words: [
                'Please',
                'note',
                'that',
                'photography',
                'is',
                'not',
                'permitted',
                'inside',
                'the',
                'gallery',
            ],
            startTime: 19,
            endTime: 23,
        },
    ],
};

export default function DictationPracticePage() {
    const { id: dictationTestId } = useParams();
    const {
        data: sections,
        isLoading,
        isError,
    } = useGetSectionQuestions(dictationTestId as string);

    const { data: test } = useGetDictationTest(dictationTestId as string);
    const [showModeDialog, setShowModeDialog] = useState(true);
    const [mode, setMode] = useState<'beginner' | 'master' | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(80);
    const [currentSentence, setCurrentSentence] = useState(0);
    const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
    const [userInput, setUserInput] = useState('');
    const [completedSentences, setCompletedSentences] = useState<Set<number>>(
        new Set(),
    );
    const [showAudioPanel, setShowAudioPanel] = useState(true);
    const [showTranscriptPanel, setShowTranscriptPanel] = useState(true);
    const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeQ, setActiveQ] = useState<string | undefined>(undefined);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <NotFound />;
    const normalizeWord = (word: string) => {
        return word
            .toLowerCase()
            .replace(/[.,!?;:]/g, '')
            .trim();
    };

    const getWordComparison = () => {
        const correctWords = mockDictationData.sentences[currentSentence].words;
        const userWords = userInput
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0);

        return correctWords.map((correctWord, idx) => {
            if (idx >= userWords.length) {
                return { word: correctWord, status: 'untyped' as const };
            }

            const userWord = userWords[idx];
            const isCorrect =
                normalizeWord(correctWord) === normalizeWord(userWord);

            return {
                word: correctWord,
                userWord: userWord,
                status: isCorrect
                    ? ('correct' as const)
                    : ('incorrect' as const),
            };
        });
    };

    const isCurrentSentenceComplete = () => {
        const correctWords = mockDictationData.sentences[currentSentence].words;
        const userWords = userInput
            .trim()
            .split(/\s+/)
            .filter((w) => w.length > 0);

        if (userWords.length !== correctWords.length) return false;

        return correctWords.every((correctWord, idx) => {
            return normalizeWord(correctWord) === normalizeWord(userWords[idx]);
        });
    };

    const handleContinue = () => {
        if (!isCurrentSentenceComplete()) {
            alert('Please complete the sentence correctly before continuing.');
            return;
        }

        setCompletedSentences((prev) => new Set(prev).add(currentSentence));

        if (currentSentence < mockDictationData.sentences.length - 1) {
            setCurrentSentence(currentSentence + 1);
            setUserInput('');
            setRevealedWords(new Set());
        } else {
            alert("Congratulations! You've completed all sentences!");
        }
    };

    const completionPercentage = Math.round(
        (completedSentences.size / mockDictationData.sentences.length) * 100,
    );

    const handleModeSelect = (selectedMode: 'beginner' | 'master') => {
        setMode(selectedMode);
        setShowModeDialog(false);
    };

    const toggleWordReveal = (sentenceId: number, wordIndex: number) => {
        const key = `${sentenceId}-${wordIndex}`;
        setRevealedWords((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const revealAllWords = () => {
        const allKeys = mockDictationData.sentences.flatMap((sentence) =>
            sentence.words.map((_, idx) => `${sentence.id}-${idx}`),
        );
        setRevealedWords(new Set(allKeys));
    };

    const showAllWords = () => {
        const allKeys = currentSentenceData.words.map(
            (_, idx) => `${currentSentenceData.id}-${idx}`,
        );
        setRevealedWords((prev) => new Set([...prev, ...allKeys]));
    };

    const hideAllWords = () => {
        const currentKeys = currentSentenceData.words.map(
            (_, idx) => `${currentSentenceData.id}-${idx}`,
        );
        setRevealedWords((prev) => {
            const newSet = new Set(prev);
            currentKeys.forEach((key) => newSet.delete(key));
            return newSet;
        });
    };

    const currentSentenceData = mockDictationData.sentences[currentSentence];
    const wordComparison = getWordComparison();

    return (
        <>
            <ModeSelectionDialog
                showModeDialog={showModeDialog}
                setShowModeDialog={setShowModeDialog}
                handleModeSelect={handleModeSelect}
            />
            <ShowShortcutDialog
                showShortcutsDialog={showShortcutsDialog}
                setShowShortcutsDialog={setShowShortcutsDialog}
            />

            {mode && (
                <div className="flex h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50/20 to-teal-50/20">
                    <div className="border-b bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/dictation">
                                    <Button variant="ghost" size="icon">
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <div>
                                    <div className="text-muted-foreground text-sm">
                                        Dictation Test
                                    </div>
                                    <h1 className="text-xl font-bold">
                                        {test?.title}
                                    </h1>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowShortcutsDialog(true)}
                                    className="hover:bg-slate-50"
                                >
                                    <Keyboard className="mr-2 h-4 w-4" />
                                    Shortcuts
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowAudioPanel(!showAudioPanel)
                                    }
                                    className={cn(
                                        'hover:bg-slate-50',
                                        !showAudioPanel && 'bg-slate-100',
                                    )}
                                >
                                    <HideIcon className="mr-2 h-4 w-4" />
                                    {showAudioPanel ? 'Hide' : 'Show'} Media
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setShowTranscriptPanel(
                                            !showTranscriptPanel,
                                        )
                                    }
                                    className={cn(
                                        'hover:bg-slate-50',
                                        !showTranscriptPanel && 'bg-slate-100',
                                    )}
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    {showTranscriptPanel ? 'Hide' : 'Show'}{' '}
                                    Transcript
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMenuOpen((prev) => !prev)}
                                    className={cn(
                                        'bg-white hover:bg-slate-50',
                                        menuOpen && 'border-slate-400',
                                    )}
                                >
                                    <Menu className="mr-2 h-4 w-4" />
                                    {menuOpen ? 'Hide' : 'Show'} Menu
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-1 gap-6 overflow-hidden p-6">
                        {showAudioPanel && (
                            <AudioPlayer
                                currentTime={currentTime}
                                setCurrentTime={setCurrentTime}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                volume={volume}
                                setVolume={setVolume}
                                playbackSpeed={playbackSpeed}
                                setPlaybackSpeed={setPlaybackSpeed}
                            />
                        )}

                        <Card className="flex flex-1 flex-col border-0 shadow-xl">
                            <div className="border-b bg-gradient-to-r from-emerald-100/70 to-teal-100/60 p-5">
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Dictation Practice
                                </h2>
                            </div>
                            <div className="flex-1 overflow-auto bg-gradient-to-br from-emerald-50/40 to-teal-50/30 p-8">
                                <div className="mb-8 flex items-center justify-center gap-3">
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                            setCurrentSentence(
                                                Math.max(
                                                    0,
                                                    currentSentence - 1,
                                                ),
                                            )
                                        }
                                        disabled={currentSentence === 0}
                                        className="h-10 w-10 rounded-full bg-white shadow-sm transition-all hover:shadow-md disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() =>
                                            setCurrentSentence(
                                                Math.min(
                                                    mockDictationData.sentences
                                                        .length - 1,
                                                    currentSentence + 1,
                                                ),
                                            )
                                        }
                                        disabled={
                                            currentSentence ===
                                            mockDictationData.sentences.length -
                                                1
                                        }
                                        className="h-10 w-10 rounded-full bg-white shadow-sm transition-all hover:shadow-md disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="mb-8 space-y-4">
                                    <div className="text-sm font-semibold text-teal-700">
                                        Type what you hear:
                                    </div>
                                    <div className="rounded-2xl border-2 border-blue-200/60 bg-white p-8 text-lg leading-relaxed shadow-lg">
                                        {wordComparison.map((result, idx) => {
                                            const key = `${currentSentenceData.id}-${idx}`;
                                            const isRevealed =
                                                revealedWords.has(key);

                                            return (
                                                <span
                                                    key={idx}
                                                    className="inline-block"
                                                >
                                                    {result.status ===
                                                    'correct' ? (
                                                        <span className="rounded-lg border-2 border-teal-400 bg-white px-2.5 py-1 font-semibold text-teal-700 shadow-sm">
                                                            {result.word}
                                                        </span>
                                                    ) : result.status ===
                                                      'incorrect' ? (
                                                        <span className="rounded-lg border-2 border-rose-400 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                                                            {result.userWord}
                                                        </span>
                                                    ) : isRevealed ? (
                                                        <span className="rounded bg-blue-100/70 px-2 py-0.5 font-semibold text-blue-700">
                                                            {result.word}
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono text-slate-400">
                                                            {'*'.repeat(
                                                                result.word
                                                                    .length,
                                                            )}
                                                        </span>
                                                    )}
                                                    {idx <
                                                        wordComparison.length -
                                                            1 && ' '}
                                                </span>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {currentSentenceData.words.map(
                                            (word, idx) => {
                                                const key = `${currentSentenceData.id}-${idx}`;
                                                const isRevealed =
                                                    revealedWords.has(key);
                                                return (
                                                    <Button
                                                        key={idx}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            toggleWordReveal(
                                                                currentSentenceData.id,
                                                                idx,
                                                            )
                                                        }
                                                        className={cn(
                                                            'shadow-sm transition-all hover:shadow-md',
                                                            isRevealed
                                                                ? 'border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                                : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50',
                                                        )}
                                                    >
                                                        {isRevealed ? (
                                                            <>
                                                                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                                                                {word}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="mr-1.5 h-3.5 w-3.5" />
                                                                {'*'.repeat(
                                                                    Math.min(
                                                                        word.length,
                                                                        7,
                                                                    ),
                                                                )}
                                                            </>
                                                        )}
                                                    </Button>
                                                );
                                            },
                                        )}
                                    </div>

                                    <div className="flex items-start gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 p-4 text-sm text-amber-800">
                                        <span className="text-base">💡</span>
                                        <span>
                                            Revealed words will be counted as
                                            errors and affect your score.
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-8 space-y-3">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Your Answer:
                                    </label>
                                    <Textarea
                                        value={userInput}
                                        onChange={(e) =>
                                            setUserInput(e.target.value)
                                        }
                                        placeholder="Type what you hear from the audio..."
                                        className="min-h-[140px] resize-none rounded-xl border-slate-200 bg-white text-base leading-relaxed shadow-sm transition-shadow focus:border-teal-400 focus:shadow-md"
                                    />
                                    <p className="text-sm text-slate-600">
                                        Write down everything you hear. You can
                                        replay the audio as many times as
                                        needed.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={showAllWords}
                                            className="h-12 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-base text-white shadow-lg transition-all hover:from-rose-500 hover:to-pink-600 hover:shadow-xl"
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Show All Words
                                        </Button>
                                        <Button
                                            onClick={hideAllWords}
                                            variant="outline"
                                            className="h-12 rounded-xl border-2 border-slate-300 bg-transparent text-base text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:shadow-lg"
                                        >
                                            <EyeOff className="mr-2 h-4 w-4" />
                                            Hide All Words
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleContinue}
                                        disabled={!isCurrentSentenceComplete()}
                                        variant="outline"
                                        className={cn(
                                            'h-12 w-full rounded-xl border-2 text-base shadow-md transition-all hover:shadow-lg',
                                            isCurrentSentenceComplete()
                                                ? 'border-teal-400 bg-white text-teal-700 hover:bg-teal-50'
                                                : 'cursor-not-allowed border-slate-300 bg-slate-50 text-slate-400',
                                        )}
                                    >
                                        {isCurrentSentenceComplete() ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Continue
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Complete the sentence to
                                                continue
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {showTranscriptPanel && (
                            <Card className="w-[350px] border-0 shadow-xl">
                                <div className="border-b bg-gradient-to-r from-indigo-100/70 to-blue-100/60 p-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-slate-800">
                                            Transcript
                                        </h2>
                                        <Badge
                                            variant="secondary"
                                            className="bg-indigo-100 text-indigo-700"
                                        >
                                            {completionPercentage}%
                                        </Badge>
                                    </div>
                                </div>
                                <div className="overflow-auto bg-gradient-to-br from-indigo-50/30 to-blue-50/20 p-4">
                                    <div className="space-y-3">
                                        {mockDictationData.sentences.map(
                                            (sentence, idx) => {
                                                const isCompleted =
                                                    completedSentences.has(idx);
                                                return (
                                                    <Card
                                                        key={sentence.id}
                                                        className={cn(
                                                            'cursor-pointer border-2 p-4 transition-all hover:shadow-md',
                                                            currentSentence ===
                                                                idx
                                                                ? 'border-teal-400 bg-teal-50/60 shadow-lg shadow-teal-400/20'
                                                                : isCompleted
                                                                  ? 'border-emerald-400 bg-emerald-50/60'
                                                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                                                        )}
                                                        onClick={() =>
                                                            setCurrentSentence(
                                                                idx,
                                                            )
                                                        }
                                                    >
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-slate-700">
                                                                    #
                                                                    {
                                                                        sentence.id
                                                                    }
                                                                </span>
                                                                {isCompleted && (
                                                                    <Badge className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 p-0 text-white">
                                                                        <Check className="h-3 w-3" />
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 hover:bg-white/80"
                                                                >
                                                                    <Edit3 className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 hover:bg-white/80"
                                                                >
                                                                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="font-mono text-sm leading-relaxed text-slate-500">
                                                            {isCompleted
                                                                ? sentence.text
                                                                : sentence.words.map(
                                                                      (
                                                                          word,
                                                                          wordIdx,
                                                                      ) => (
                                                                          <span
                                                                              key={
                                                                                  wordIdx
                                                                              }
                                                                          >
                                                                              {'*'.repeat(
                                                                                  word.length,
                                                                              )}
                                                                              {wordIdx <
                                                                                  sentence
                                                                                      .words
                                                                                      .length -
                                                                                      1 &&
                                                                                  ' '}
                                                                          </span>
                                                                      ),
                                                                  )}
                                                        </div>
                                                    </Card>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        <SectionsMenu
                            open={menuOpen}
                            onOpenChange={setMenuOpen}
                            title="Sections"
                            testId={dictationTestId as string}
                            activeQuestionId={activeQ}
                            onSelectQuestion={(qid) => {
                                setActiveQ(qid);
                                setMenuOpen(false);
                            }}
                            sections={sections ?? []}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
