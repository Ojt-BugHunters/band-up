'use client';

import { motion } from 'framer-motion';
import { Home, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Room } from '@/lib/api/dto/room';
import { cn } from '@/lib/utils';

interface RoomResumeCardProps {
    room: Room;
}

export function RoomResumeCard({ room }: RoomResumeCardProps) {
    const router = useRouter();
    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(/room-bg-1.jpg)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-slate-900/60" />
            </div>

            <div className="relative z-10 flex h-full items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={cn(
                        'mx-auto w-[90%] max-w-2xl rounded-3xl border border-white/10',
                        'bg-gradient-to-b from-white/10 via-white/5 to-black/40',
                        'shadow-[0_0_40px_rgba(0,0,0,0.6),_inset_0_1px_4px_rgba(255,255,255,0.1)] backdrop-blur-2xl',
                        'p-10 text-center text-white',
                    )}
                >
                    <div className="mb-6 flex justify-center">
                        <div className="rounded-full bg-cyan-500/20 p-4 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                            <Home className="h-10 w-10 text-cyan-400" />
                        </div>
                    </div>

                    <h2 className="mb-2 text-3xl font-bold drop-shadow-md">
                        {room?.roomName}
                    </h2>
                    <p className="mb-8 text-white/70">{room?.description}</p>

                    <div className="mb-8 flex justify-center gap-8 text-sm text-white/80">
                        <span className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-cyan-400" />{' '}
                            {room?.numberOfMembers} active
                        </span>
                        <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-mono text-white/60">
                            Code: {room?.roomCode}
                        </span>
                    </div>

                    <Button
                        onClick={() => router.push(`/room/${room?.id}`)}
                        className="mx-auto flex items-center gap-2 rounded-xl bg-cyan-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-cyan-600"
                    >
                        Back to Room <ArrowRight className="h-4 w-4" />
                    </Button>

                    <p className="mt-8 text-sm text-white/50">
                        You’re already in this room. Continue where you left
                        off.
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
