import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import WritingPractice from '@/components/writing-practice';
import { MessageSquare, Mic } from 'lucide-react';
import { useState } from 'react';

export function AIChatDisplay() {
    const [chatTab, setChatTab] = useState<'writing' | 'speaking'>('writing');
    const [message, setMessage] = useState('');

    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                        AI Assistant
                    </h1>
                </div>

                <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                    <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                        ND
                    </AvatarFallback>
                </Avatar>
            </header>

            <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-24">
                {chatTab === 'writing' && (
                    <WritingPractice
                        title="Writing Practice"
                        taskNumber={1}
                        prompt="Some people believe that students should focus on STEM subjects, while others argue that arts and humanities are equally important. Discuss both views and give your own opinion."
                        notes="Aim for a balanced argument: introduce, compare viewpoints with examples, and conclude with your stance."
                        minWords={250}
                    />
                )}

                {chatTab === 'speaking' && (
                    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-8 shadow-xl shadow-black/20 backdrop-blur-md">
                        <Mic className="h-16 w-16 text-white" />
                        <p className="text-white/80">Listening...</p>
                    </div>
                )}

                <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
                    <button
                        onClick={() => setChatTab('writing')}
                        className={`relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95 ${
                            chatTab === 'writing'
                                ? 'ring-2 ring-emerald-400/60'
                                : ''
                        }`}
                    >
                        <div
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                            style={{
                                background:
                                    'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                                maskImage:
                                    'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                            }}
                        />
                        <MessageSquare className="relative z-10 h-5 w-5 text-white" />
                    </button>

                    <button
                        onClick={() => setChatTab('speaking')}
                        className={`relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95 ${
                            chatTab === 'speaking'
                                ? 'ring-2 ring-indigo-400/60'
                                : ''
                        }`}
                    >
                        <div
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                            style={{
                                background:
                                    'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                            }}
                        />
                        <div
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                                maskImage:
                                    'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                            }}
                        />
                        <Mic className="relative z-10 h-5 w-5 text-white" />
                    </button>
                </div>
            </main>
        </div>
    );
}
