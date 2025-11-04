import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users } from 'lucide-react';
import { useState } from 'react';

const mockUsers = [
    { id: 1, name: 'Nam Dang', avatar: 'ND', status: 'online' },
    { id: 2, name: 'John Doe', avatar: 'JD', status: 'online' },
    { id: 3, name: 'Jane Smith', avatar: 'JS', status: 'away' },
    { id: 4, name: 'Mike Wilson', avatar: 'MW', status: 'online' },
];

export function ChattingRoomDisplay() {
    const [roomMessage, setRoomMessage] = useState('');

    return (
        <div className="flex h-full">
            <div className="flex flex-1 flex-col">
                <header className="flex items-center justify-between border-b border-zinc-700/50 p-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <h1 className="text-xl font-semibold text-white drop-shadow-lg">
                            Study Room Chat
                        </h1>
                    </div>
                </header>

                <main className="flex-1 space-y-4 overflow-y-auto p-6">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                            <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                                JD
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                    John Doe
                                </span>
                                <span className="text-xs text-white/50">
                                    10:30 AM
                                </span>
                            </div>
                            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md">
                                <p className="text-sm text-white">
                                    Hey everyone! Ready for the study session?
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                            <AvatarFallback className="bg-zinc-800/80 text-white backdrop-blur-md">
                                JS
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">
                                    Jane Smith
                                </span>
                                <span className="text-xs text-white/50">
                                    10:32 AM
                                </span>
                            </div>
                            <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md">
                                <p className="text-sm text-white">
                                    Yes! Let us focus on the math assignment
                                    today.
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t border-zinc-700/50 p-6">
                    <div className="flex gap-2">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={roomMessage}
                            onChange={(e) => setRoomMessage(e.target.value)}
                            className="flex-1 rounded-xl border-zinc-700/50 bg-zinc-800/80 text-white placeholder:text-white/50"
                        />
                        <Button className="rounded-xl bg-white text-black shadow-lg shadow-black/20 hover:bg-white/90">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </footer>
            </div>

            <div className="w-64 border-l border-zinc-700/50 bg-zinc-900/50 p-4 backdrop-blur-md">
                <h2 className="mb-4 text-sm font-semibold text-white/70">
                    MEMBERS — {mockUsers.length}
                </h2>
                <div className="space-y-2">
                    {mockUsers.map((user) => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 rounded-xl border border-zinc-700/30 bg-zinc-800/50 p-3 shadow-md shadow-black/10 backdrop-blur-md transition-all hover:bg-zinc-700/50"
                        >
                            <div className="relative">
                                <Avatar className="h-8 w-8 border border-zinc-700/50">
                                    <AvatarFallback className="bg-zinc-700/80 text-xs text-white">
                                        {user.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div
                                    className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-zinc-900 ${
                                        user.status === 'online'
                                            ? 'bg-green-500'
                                            : 'bg-yellow-500'
                                    }`}
                                />
                            </div>
                            <span className="text-sm text-white">
                                {user.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
