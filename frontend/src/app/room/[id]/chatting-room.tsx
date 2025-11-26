'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { toast } from 'sonner';
import { useGetAvatar, useUser } from '@/lib/service/account';

interface ChattingRoomProps {
    roomId: string;
}

type Message = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string; // URL hoặc initials
    time: string;
    text: string;
};

type SenderDto = {
    id: string;
    name: string;
};

type RoomAction = 'JOIN' | 'LEAVE';

type WsMessageDto = {
    content: string;
    sender: SenderDto;
    target: string;
    images?: string[] | null;
    action?: RoomAction | null;
};

export function ChattingRoomDisplay({ roomId }: ChattingRoomProps) {
    const user = useUser();
    const { data: avatarResponse } = useGetAvatar();

    const [roomMessage, setRoomMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const currentUserId = user?.id as string;
    const currentUserName = user?.name as string;
    const currentUserAvatar = avatarResponse?.cloudFrontUrl as
        | string
        | undefined;

    const stompClientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!user?.id || !roomId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                setIsConnected(true);
                toast.success('Connect Successfully');

                client.subscribe(
                    `/topic/room/${roomId}`,
                    (message: IMessage) => {
                        try {
                            const body: WsMessageDto = JSON.parse(message.body);
                            const sender = body.sender;

                            const initials = sender.name
                                .split(' ')
                                .map((p) => p[0])
                                .join('')
                                .toUpperCase();

                            const isMe = sender.id === currentUserId;

                            const uiMessage: Message = {
                                id: Date.now().toString(),
                                userId: sender.id,
                                userName: sender.name,
                                userAvatar: isMe
                                    ? currentUserAvatar || initials
                                    : initials,
                                text: body.content,
                                time: new Date().toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }),
                            };

                            setMessages((prev) => [...prev, uiMessage]);
                        } catch (e) {
                            console.error('Failed to parse message', e);
                        }
                    },
                );

                const addUserPayload: WsMessageDto = {
                    content: `${currentUserName} joined`,
                    sender: {
                        id: currentUserId,
                        name: currentUserName,
                    },
                    target: roomId,
                    images: null,
                    action: 'JOIN',
                };

                client.publish({
                    destination: '/app/chat.addUser',
                    body: JSON.stringify(addUserPayload),
                });
            },
            onStompError: (frame) => {
                console.error(
                    'Broker reported error: ' + frame.headers['message'],
                );
                console.error('Additional details: ' + frame.body);
            },
            onWebSocketClose: () => {
                setIsConnected(false);
            },
        });

        stompClientRef.current = client;
        client.activate();

        return () => {
            client.deactivate();
            stompClientRef.current = null;
        };
    }, [roomId, currentUserId, currentUserName, user?.id, currentUserAvatar]);

    const sendMessage = () => {
        const text = roomMessage.trim();
        if (!text || !currentUserId || !currentUserName) return;

        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const client = stompClientRef.current;

        if (!client || !isConnected) {
            const localMsg: Message = {
                id: Date.now().toString(),
                userId: currentUserId,
                userName: currentUserName,
                userAvatar:
                    currentUserAvatar ||
                    currentUserName
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .toUpperCase(),
                text,
                time: now,
            };
            setMessages((prev) => [...prev, localMsg]);
            setRoomMessage('');
            return;
        }

        const payload: WsMessageDto = {
            content: text,
            sender: {
                id: currentUserId,
                name: currentUserName,
            },
            target: roomId,
            images: null,
            action: null,
        };

        client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(payload),
        });

        setRoomMessage('');
    };

    return (
        <div className="flex h-full w-full">
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="justify_between relative z-10 flex items-center border-b border-white/10 bg-black/20 px-6 py-4 shadow-[0_8px_25px_rgba(0,0,0,.45)] backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 shadow-[inset_0_2px_4px_rgba(255,255,255,.08)]">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold text-white">
                                Study Room Chat
                            </h1>
                            <span className="text-xs text-white/60">
                                {isConnected
                                    ? 'Connected to room realtime'
                                    : 'Offline (showing local messages)'}
                            </span>
                        </div>
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
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 opacity-15"
                        style={{
                            background:
                                'radial-gradient(1200px 600px at 50% -20%, rgba(255,255,255,.06), transparent 65%)',
                        }}
                    />

                    <div className="mx-auto h-full w-full max-w-[1600px] px-6 py-6">
                        <div className="flex h-full flex-col gap-6">
                            {messages.map((m) => {
                                const isMe = m.userId === currentUserId;
                                const isImage =
                                    m.userAvatar &&
                                    m.userAvatar.startsWith('http');

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
                                            <Avatar className="h-10 w-10 overflow-hidden border border-white/10 bg-black/30">
                                                {isImage ? (
                                                    <AvatarImage
                                                        src={m.userAvatar}
                                                        alt={m.userName}
                                                    />
                                                ) : (
                                                    <AvatarFallback className="bg-transparent text-xs font-semibold text-white">
                                                        {m.userAvatar}
                                                    </AvatarFallback>
                                                )}
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
                            <div ref={messagesEndRef} />
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
                    MEMBERS
                </h2>
            </aside>
        </div>
    );
}
