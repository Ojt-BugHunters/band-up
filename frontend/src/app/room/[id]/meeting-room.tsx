'use client';
import {
    Mic,
    MicOff,
    MonitorPlay,
    PhoneOff,
    Video,
    VideoOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const LOCAL_PARTICIPANT_ID = 1;

const participants = [
    { id: 1, name: 'You', avatar: 'YO', isVideoOn: true, isMicOn: true },
    {
        id: 2,
        name: 'Nam Dang',
        avatar: 'ND',
        isVideoOn: true,
        isMicOn: true,
    },
    {
        id: 3,
        name: 'John Doe',
        avatar: 'JD',
        isVideoOn: false,
        isMicOn: true,
    },
    {
        id: 4,
        name: 'Jane Smith',
        avatar: 'JS',
        isVideoOn: true,
        isMicOn: false,
    },
    {
        id: 5,
        name: 'Alex Chen',
        avatar: 'AC',
        isVideoOn: true,
        isMicOn: true,
    },
    {
        id: 6,
        name: 'Sarah Lee',
        avatar: 'SL',
        isVideoOn: true,
        isMicOn: true,
    },
    {
        id: 7,
        name: 'Nam Dang',
        avatar: 'ND',
        isVideoOn: true,
        isMicOn: true,
    },
    {
        id: 8,
        name: 'John Doe',
        avatar: 'JD',
        isVideoOn: false,
        isMicOn: true,
    },
    {
        id: 9,
        name: 'Jane Smith',
        avatar: 'JS',
        isVideoOn: true,
        isMicOn: false,
    },
    {
        id: 10,
        name: 'Alex Chen',
        avatar: 'AC',
        isVideoOn: true,
        isMicOn: true,
    },
    {
        id: 11,
        name: 'Sarah Lee',
        avatar: 'SL',
        isVideoOn: true,
        isMicOn: true,
    },
];

const getGridCols = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    if (count <= 16) return 'grid-cols-4';
    return 'grid-cols-5';
};

export function CollaborationDisplay() {
    const [isMicOn, setIsMicOn] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [focusedParticipantId, setFocusedParticipantId] = useState<
        number | null
    >(null);

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    const handleLocalVideoRef = (el: HTMLVideoElement | null) => {
        localVideoRef.current = el;

        if (el && localStream) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (el as any).srcObject = localStream;
            el.play().catch(() => {});
        }
    };

    const focusedParticipant = participants.find(
        (p) => p.id === focusedParticipantId,
    );
    const otherParticipants = participants.filter(
        (p) => p.id !== focusedParticipantId,
    );

    const handleParticipantClick = (participantId: number) => {
        if (focusedParticipantId === participantId) {
            setFocusedParticipantId(null);
        } else {
            setFocusedParticipantId(participantId);
        }
    };

    const startCamera = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                console.error('getUserMedia is not supported in this browser');
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            setLocalStream(stream);
            setIsVideoOn(true);
        } catch (error) {
            console.error('Cannot access camera:', error);
        }
    };

    const stopCamera = () => {
        localStream?.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        setIsVideoOn(false);
    };

    const handleToggleVideo = () => {
        if (isVideoOn) {
            stopCamera();
        } else {
            void startCamera();
        }
    };

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex h-full flex-col gap-6 p-6">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <MonitorPlay className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white drop-shadow-lg">
                            Collaboration Room
                        </h1>
                        <p className="text-sm text-white/60">
                            {participants.length} participants
                        </p>
                    </div>
                </div>
            </header>

            {focusedParticipant ? (
                <div className="flex flex-1 flex-col gap-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group relative flex-1 cursor-pointer overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/20 backdrop-blur-md"
                        onClick={() =>
                            handleParticipantClick(focusedParticipant.id)
                        }
                    >
                        {/* VIDEO / AVATAR TRONG SPOTLIGHT */}
                        {focusedParticipant.id === LOCAL_PARTICIPANT_ID &&
                        isVideoOn ? (
                            <video
                                ref={handleLocalVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        ) : focusedParticipant.isVideoOn ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                <div className="text-9xl font-bold text-white/20">
                                    {focusedParticipant.avatar}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-zinc-600/50 bg-zinc-700/80">
                                        <span className="text-5xl font-bold text-white">
                                            {focusedParticipant.avatar}
                                        </span>
                                    </div>
                                    <VideoOff className="h-8 w-8 text-white/50" />
                                </div>
                            </div>
                        )}

                        {/* THANH TÊN + MIC */}
                        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-white drop-shadow-lg">
                                    {focusedParticipant.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    {(
                                        focusedParticipant.id ===
                                        LOCAL_PARTICIPANT_ID
                                            ? isMicOn
                                            : focusedParticipant.isMicOn
                                    ) ? (
                                        <div className="rounded-lg bg-green-500/80 p-2 backdrop-blur-md">
                                            <Mic className="h-4 w-4 text-white" />
                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-red-500/80 p-2 backdrop-blur-md">
                                            <MicOff className="h-4 w-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                            <div className="rounded-full border border-white/20 bg-black/60 px-4 py-2 backdrop-blur-md">
                                <span className="text-sm text-white">
                                    Click to exit spotlight
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <div className="grid h-32 grid-cols-5 gap-3">
                        {otherParticipants.map((participant, index) => {
                            const isSelf =
                                participant.id === LOCAL_PARTICIPANT_ID;
                            const micOn = isSelf
                                ? isMicOn
                                : participant.isMicOn;

                            return (
                                <motion.div
                                    key={participant.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:border-zinc-500/50"
                                    onClick={() =>
                                        handleParticipantClick(participant.id)
                                    }
                                >
                                    {isSelf && isVideoOn ? (
                                        <video
                                            ref={handleLocalVideoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : participant.isVideoOn ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                            <div className="text-2xl font-bold text-white/20">
                                                {participant.avatar}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-600/50 bg-zinc-700/80">
                                                    <span className="text-xs font-bold text-white">
                                                        {participant.avatar}
                                                    </span>
                                                </div>
                                                <VideoOff className="h-3 w-3 text-white/50" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate text-xs font-semibold text-white drop-shadow-lg">
                                                {participant.name}
                                            </span>
                                            {micOn ? (
                                                <div className="rounded bg-green-500/80 p-0.5 backdrop-blur-md">
                                                    <Mic className="h-2 w-2 text-white" />
                                                </div>
                                            ) : (
                                                <div className="rounded bg-red-500/80 p-0.5 backdrop-blur-md">
                                                    <MicOff className="h-2 w-2 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div
                    className={`grid flex-1 gap-4 ${getGridCols(participants.length)}`}
                >
                    {participants.map((participant, index) => {
                        const isSelf = participant.id === LOCAL_PARTICIPANT_ID;
                        const micOn = isSelf ? isMicOn : participant.isMicOn;

                        return (
                            <motion.div
                                key={participant.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative aspect-video cursor-pointer overflow-hidden rounded-2xl border border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:border-zinc-500/50"
                                onClick={() =>
                                    handleParticipantClick(participant.id)
                                }
                            >
                                {/* VIDEO / AVATAR Ở GRID CHÍNH */}
                                {isSelf && isVideoOn ? (
                                    <video
                                        ref={handleLocalVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                ) : participant.isVideoOn ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-700/50 to-zinc-900/50">
                                        <div className="text-6xl font-bold text-white/20">
                                            {participant.avatar}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-zinc-600/50 bg-zinc-700/80">
                                                <span className="text-2xl font-bold text-white">
                                                    {participant.avatar}
                                                </span>
                                            </div>
                                            <VideoOff className="h-6 w-6 text-white/50" />
                                        </div>
                                    </div>
                                )}

                                {/* TÊN + MIC */}
                                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-white drop-shadow-lg">
                                            {participant.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {micOn ? (
                                                <div className="rounded-lg bg-green-500/80 p-1.5 backdrop-blur-md">
                                                    <Mic className="h-3 w-3 text-white" />
                                                </div>
                                            ) : (
                                                <div className="rounded-lg bg-red-500/80 p-1.5 backdrop-blur-md">
                                                    <MicOff className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
                                    <div className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                                        <span className="text-xs text-white">
                                            Click to spotlight
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            <footer className="flex items-center justify-center gap-4">
                <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isMicOn
                            ? 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                            : 'border-red-400/50 bg-red-500/90 shadow-lg shadow-red-500/30 hover:bg-red-600/90 hover:shadow-red-400/50'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {isMicOn ? (
                        <Mic className="relative z-10 h-6 w-6 text-white" />
                    ) : (
                        <MicOff className="relative z-10 h-6 w-6 text-white" />
                    )}
                </button>

                <button
                    onClick={handleToggleVideo}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isVideoOn
                            ? 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                            : 'border-red-400/50 bg-red-500/90 shadow-lg shadow-red-500/30 hover:bg-red-600/90 hover:shadow-red-400/50'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    {isVideoOn ? (
                        <Video className="relative z-10 h-6 w-6 text-white" />
                    ) : (
                        <VideoOff className="relative z-10 h-6 w-6 text-white" />
                    )}
                </button>

                <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`group relative rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isScreenSharing
                            ? 'border-green-400/50 bg-green-500/90 shadow-lg shadow-green-500/30 hover:bg-green-600/90 hover:shadow-green-400/50'
                            : 'border-zinc-600/50 bg-zinc-800/90 shadow-lg shadow-zinc-500/20 hover:bg-zinc-700/90 hover:shadow-zinc-400/30'
                    }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <MonitorPlay className="relative z-10 h-6 w-6 text-white" />
                </button>

                <button className="group relative rounded-2xl border border-red-400/50 bg-red-500/90 p-4 shadow-lg shadow-red-500/30 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-red-600/90 hover:shadow-red-400/50 active:scale-95">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <PhoneOff className="relative z-10 h-6 w-6 text-white" />
                </button>
            </footer>
        </div>
    );
}
