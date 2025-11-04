'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type User = {
    id: number;
    name: string;
    avatar: string;
    status: 'online' | 'away';
};
type Message = {
    id: number;
    userId: number;
    userName: string;
    userAvatar: string;
    text: string;
    time: string;
};

const mockUsers: User[] = [
    { id: 1, name: 'Nam Dang', avatar: 'ND', status: 'online' },
    { id: 2, name: 'John Doe', avatar: 'JD', status: 'online' },
    { id: 3, name: 'Jane Smith', avatar: 'JS', status: 'away' },
    { id: 4, name: 'Mike Wilson', avatar: 'MW', status: 'online' },
];

const long = (s: string) =>
    `${s} This took me a while to figure out, but the key was to break the problem into parts and verify each step carefully.`;

const mockMessages: Message[] = [
    {
        id: 1,
        userId: 2,
        userName: 'John Doe',
        userAvatar: 'JD',
        text: 'Hey everyone! Ready for the study session?',
        time: '10:30 AM',
    },
    {
        id: 2,
        userId: 3,
        userName: 'Jane Smith',
        userAvatar: 'JS',
        text: 'Yesss! Let’s focus on the math assignment today.',
        time: '10:32 AM',
    },
    {
        id: 3,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'Great. I’ll share my solutions for Q1–Q3 first.',
        time: '10:33 AM',
    },
    {
        id: 4,
        userId: 4,
        userName: 'Mike Wilson',
        userAvatar: 'MW',
        text: 'I’m stuck at Q2. Can someone explain the approach?',
        time: '10:34 AM',
    },
    {
        id: 5,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'Sure, it’s basically about factoring and using the identity. I’ll type it below.',
        time: '10:35 AM',
    },
    {
        id: 6,
        userId: 2,
        userName: 'John Doe',
        userAvatar: 'JD',
        text: long('I tried substitution but it got messy.'),
        time: '10:36 AM',
    },
    {
        id: 7,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'For Q2, start by isolating the squared term, then complete the square. After that, compare coefficients.',
        time: '10:37 AM',
    },
    {
        id: 8,
        userId: 3,
        userName: 'Jane Smith',
        userAvatar: 'JS',
        text: 'I can share how I wrote the steps if that helps.',
        time: '10:38 AM',
    },
    {
        id: 9,
        userId: 4,
        userName: 'Mike Wilson',
        userAvatar: 'MW',
        text: 'Please do! Screenshots or a short summary?',
        time: '10:39 AM',
    },
    {
        id: 10,
        userId: 3,
        userName: 'Jane Smith',
        userAvatar: 'JS',
        text: long(
            'Summary incoming! I’ll outline the factorization pattern first, then the identity we used.',
        ),
        time: '10:40 AM',
    },
    {
        id: 11,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'Also remember the discriminant check so we know roots are real.',
        time: '10:41 AM',
    },
    {
        id: 12,
        userId: 2,
        userName: 'John Doe',
        userAvatar: 'JD',
        text: 'Good call. I forgot to check that earlier.',
        time: '10:42 AM',
    },
    {
        id: 13,
        userId: 4,
        userName: 'Mike Wilson',
        userAvatar: 'MW',
        text: long('I’ll try rewriting Q2 now with your hints. Thanks!'),
        time: '10:43 AM',
    },
    {
        id: 14,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'Ping when you’re done. We can compare answers.',
        time: '10:44 AM',
    },
    {
        id: 15,
        userId: 3,
        userName: 'Jane Smith',
        userAvatar: 'JS',
        text: 'Uploading my notes...',
        time: '10:45 AM',
    },
    {
        id: 16,
        userId: 2,
        userName: 'John Doe',
        userAvatar: 'JD',
        text: long(
            'I think Q3 is trickier. The last step with the inequality signs always trips me up.',
        ),
        time: '10:46 AM',
    },
    {
        id: 17,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'For inequalities, flip the sign when multiplying/dividing by negative numbers. Easy to miss.',
        time: '10:47 AM',
    },
    {
        id: 18,
        userId: 4,
        userName: 'Mike Wilson',
        userAvatar: 'MW',
        text: 'That was it. I messed that part. Fixed now and it matches!',
        time: '10:48 AM',
    },
    {
        id: 19,
        userId: 3,
        userName: 'Jane Smith',
        userAvatar: 'JS',
        text: long('Notes uploaded. Tell me if any step is unclear.'),
        time: '10:49 AM',
    },
    {
        id: 20,
        userId: 2,
        userName: 'John Doe',
        userAvatar: 'JD',
        text: 'Looks good. Let’s wrap after Q4 plan.',
        time: '10:50 AM',
    },
    {
        id: 21,
        userId: 1,
        userName: 'Nam Dang',
        userAvatar: 'ND',
        text: 'Deal. I’ll draft the outline for Q4 and send shortly.',
        time: '10:51 AM',
    },
];

export function ChattingRoomDisplay() {
    const [roomMessage, setRoomMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>(mockMessages);

    const currentUserId = 1;

    const sendMessage = () => {
        const text = roomMessage.trim();
        if (!text) return;
        const newMsg: Message = {
            id: Date.now(),
            userId: currentUserId,
            userName: 'Nam Dang',
            userAvatar: 'ND',
            text,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
        setMessages((prev) => [...prev, newMsg]);
        setRoomMessage('');
    };

    return (
        <div className="flex h-full w-full">
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="relative z-10 flex items-center justify-between border-b border-white/10 bg-black/20 px-6 py-4 shadow-[0_8px_25px_rgba(0,0,0,.45)] backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 shadow-[inset_0_2px_4px_rgba(255,255,255,.08)]">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-lg font-semibold text-white">
                            Study Room Chat
                        </h1>
                    </div>
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-15"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(255,255,255,.12), rgba(255,255,255,.04) 40%, transparent 85%)',
                        }}
                    />
                </header>

                <main className="relative flex-1 overflow-y-auto">
                    <div className="mx-auto h-full w-full max-w-[1600px] px-6 py-6">
                        <div className="flex h-full flex-col gap-6">
                            {messages.map((m) => {
                                const isMe = m.userId === currentUserId;
                                return (
                                    <div
                                        key={m.id}
                                        className={cn(
                                            'flex items-start gap-3',
                                            isMe
                                                ? 'justify-end'
                                                : 'justify-start',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'mt-1.5 flex-shrink-0',
                                                isMe && 'order-2',
                                            )}
                                        >
                                            <Avatar className="h-10 w-10 border border-white/10 bg-black/30">
                                                <AvatarFallback className="bg-transparent text-xs font-semibold text-white">
                                                    {m.userAvatar}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div
                                            className={cn(
                                                'max-w-[70%]',
                                                isMe && 'order-1',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'mb-1 flex items-center gap-2',
                                                    isMe
                                                        ? 'justify-end'
                                                        : 'justify-start',
                                                )}
                                            >
                                                <span className="text-[12px] font-semibold text-white/80">
                                                    {m.userName}
                                                </span>
                                                <span className="text-[11px] text-white/55">
                                                    {m.time}
                                                </span>
                                            </div>

                                            <div
                                                className={cn(
                                                    'rounded-2xl border p-[18px] text-[15px] leading-[1.65] shadow-[0_16px_45px_rgba(0,0,0,.30)]',
                                                    isMe
                                                        ? 'border-white/10 bg-white text-zinc-900'
                                                        : 'border-white/10 bg-black/30 text-white/95 backdrop-blur-xl',
                                                )}
                                            >
                                                {m.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </main>

                <footer className="sticky bottom-0 z-10 border-t border-white/10 bg-black/20 px-6 py-4 shadow-[0_-8px_25px_rgba(0,0,0,.45)] backdrop-blur-xl">
                    <div className="mx-auto flex w-full max-w-[1600px] gap-3">
                        <div className="relative flex-1">
                            <Input
                                type="text"
                                placeholder="Type a message..."
                                value={roomMessage}
                                onChange={(e) => setRoomMessage(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && sendMessage()
                                }
                                className="h-12 rounded-2xl border-white/10 bg-black/20 pr-12 pl-4 text-white placeholder:text-white/70"
                            />
                            <Button
                                onClick={sendMessage}
                                className="absolute top-1.5 right-1.5 h-9 rounded-xl bg-white px-3 text-black shadow-lg shadow-black/30 hover:bg-white/90"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </footer>
            </div>

            <aside className="hidden w-80 border-l border-white/10 bg-black/20 p-4 backdrop-blur-xl md:block">
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-white/70">
                    MEMBERS — {mockUsers.length}
                </h2>
                <div className="space-y-2">
                    {mockUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 shadow-[0_12px_40px_rgba(0,0,0,.30)] backdrop-blur-xl transition-all hover:bg-black/40"
                        >
                            <div className="relative">
                                <Avatar className="h-8 w-8 border border-white/10 bg-black/30">
                                    <AvatarFallback className="bg-transparent text-xs font-semibold text-white">
                                        {user.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={cn(
                                        'absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-black/40',
                                        user.status === 'online'
                                            ? 'bg-emerald-400'
                                            : 'bg-amber-400',
                                    )}
                                />
                            </div>
                            <span className="text-sm text-white/90">
                                {user.name}
                            </span>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}
