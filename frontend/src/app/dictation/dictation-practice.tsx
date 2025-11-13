import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

interface DictationPracticeProps {
    currentSentence: number;
    setCurrentSentence: (sentence: number) => void;
}
export function DictationPractice({
    currentSentence,
    setCurrentSentence,
}: DictationPracticeProps) {
    return (
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
                            setCurrentSentence(Math.max(0, currentSentence - 1))
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
                                    mockDictationData.sentences.length - 1,
                                    currentSentence + 1,
                                ),
                            )
                        }
                        disabled={
                            currentSentence ===
                            mockDictationData.sentences.length - 1
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
                            const isRevealed = revealedWords.has(key);

                            return (
                                <span key={idx} className="inline-block">
                                    {result.status === 'correct' ? (
                                        <span className="rounded-lg border-2 border-teal-400 bg-white px-2.5 py-1 font-semibold text-teal-700 shadow-sm">
                                            {result.word}
                                        </span>
                                    ) : result.status === 'incorrect' ? (
                                        <span className="rounded-lg border-2 border-rose-400 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                                            {result.userWord}
                                        </span>
                                    ) : isRevealed ? (
                                        <span className="rounded bg-blue-100/70 px-2 py-0.5 font-semibold text-blue-700">
                                            {result.word}
                                        </span>
                                    ) : (
                                        <span className="font-mono text-slate-400">
                                            {'*'.repeat(result.word.length)}
                                        </span>
                                    )}
                                    {idx < wordComparison.length - 1 && ' '}
                                </span>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {currentSentenceData.words.map((word, idx) => {
                            const key = `${currentSentenceData.id}-${idx}`;
                            const isRevealed = revealedWords.has(key);
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
                                                Math.min(word.length, 7),
                                            )}
                                        </>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-8 space-y-3">
                    <label className="text-sm font-semibold text-slate-700">
                        Your Answer:
                    </label>
                    <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Type what you hear from the audio..."
                        className="min-h-[140px] resize-none rounded-xl border-slate-200 bg-white text-base leading-relaxed shadow-sm transition-shadow focus:border-teal-400 focus:shadow-md"
                    />
                    <p className="text-sm text-slate-600">
                        Write down everything you hear. You can replay the audio
                        as many times as needed.
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
                                Complete the sentence to continue
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
