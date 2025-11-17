'use client';
//...
import type React from 'react';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
    Clock,
    Video,
    Zap,
    MessageSquare,
    Mic,
    MicOff,
    VideoOff,
    MonitorPlay,
    PhoneOff,
    DoorOpen,
    Users,
    KeyRound,
} from 'lucide-react';
import { Task, AmbientSound } from '@/lib/service/room';
import {
    BACKGROUND_IMAGES,
    POMODORO_PRESETS,
    AMBIENT_SOUNDS,
} from './page.data';
import { PomodoroDisplay } from './pomodoro';
import { AIChatDisplay } from './ai-learning-chat';
import { ChattingRoomDisplay } from './chatting-room';
import { useParams } from 'next/navigation';
import {
    useGetRoomById,
    useGetRoomMembers,
    useLeftRoom,
} from '@/lib/service/room';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CollaborationDisplay } from './meeting-room';

export interface FlyingTask {
    id: string;
    text: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
}

export interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export type DisplayMode = 'pomodoro' | 'ai-chat' | 'room' | 'collaboration';

export default function RoomPage() {
    const { id } = useParams();
    const { data: room, isLoading, isFetching } = useGetRoomById(id as string);
    const { members } = useGetRoomMembers(id as string);
    const { mutate: leftRoomMutation } = useLeftRoom();
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isPomodoroMode, setIsPomodoroMode] = useState(true); // consider pomodoro mode or timelapse mode
    const [task, setTask] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('');
    const [taskList, setTaskList] = useState<Task[]>([]);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [flyingTask, setFlyingTask] = useState<FlyingTask | null>(null); // consider the task apply fling animation (todolist task)
    const [showTimerSettings, setShowTimerSettings] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(POMODORO_PRESETS[0]);
    const [countUpTimer, setCountUpTimer] = useState(false);
    const [deepFocus, setDeepFocus] = useState(false);
    const [timerTab, setTimerTab] = useState<'focus' | 'stopwatch'>('focus');

    const [customSettings, setCustomSettings] = useState<TimerSettings>({
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
    });
    const [pomodoroSession, setPomodoroSession] = useState(0);
    const [sessionType, setSessionType] = useState<
        'focus' | 'shortBreak' | 'longBreak'
    >('focus');

    const [ambientSounds, setAmbientSounds] =
        useState<AmbientSound[]>(AMBIENT_SOUNDS);
    const [showAmbientMixer, setShowAmbientMixer] = useState(false);

    const [showMusicDialog, setShowMusicDialog] = useState(false);
    const [musicLink, setMusicLink] = useState('');
    const [savedMusicLinks, setSavedMusicLinks] = useState<string[]>([]);

    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const [customBackgroundImage, setCustomBackgroundImage] = useState<
        string | null
    >(null);

    const [displayMode, setDisplayMode] = useState<DisplayMode>('pomodoro');

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardPeriod, setLeaderboardPeriod] =
        useState<TimePeriod>('daily');
    const [leaderboardDate, setLeaderboardDate] = useState(new Date());

    const [showAnalytics, setShowAnalytics] = useState(false);
    const [analyticsPeriod, setAnalyticsPeriod] = useState<
        'today' | 'week' | 'month'
    >('today');
    const [analyticsDate, setAnalyticsDate] = useState(new Date());

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const taskButtonRef = useRef<HTMLButtonElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const randomImage =
            BACKGROUND_IMAGES[
                Math.floor(Math.random() * BACKGROUND_IMAGES.length)
            ];
        setBackgroundImage(randomImage);
    }, []);

    const onLeaveroom = () => {
        leftRoomMutation(id as string);
    };

    const handlePomodoroComplete = useCallback(() => {
        if (!isPomodoroMode) return;
        const settings =
            selectedPreset.name === 'Custom' ? customSettings : selectedPreset;
        if (sessionType === 'focus') {
            // After focus, go to break
            if (pomodoroSession === 3) {
                // After 4th focus session, take long break
                setSessionType('longBreak');
                setMinutes(settings.longBreak);
                setSeconds(0);
                setPomodoroSession(0);
                toast.success('Time for long break');
            } else {
                // Take short break
                setSessionType('shortBreak');
                setMinutes(settings.shortBreak);
                setSeconds(0);
                toast.success('Time for short break');
            }
        } else {
            // After break, go back to focus
            setSessionType('focus');
            setMinutes(settings.focus);
            setSeconds(0);
            if (sessionType === 'shortBreak') {
                setPomodoroSession(pomodoroSession + 1);
            }
            toast.success('Break is over');
        }
    }, [
        isPomodoroMode,
        selectedPreset,
        customSettings,
        sessionType,
        pomodoroSession,
    ]);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                if (isPomodoroMode) {
                    // Countdown mode for Pomodoro
                    if (seconds === 0) {
                        if (minutes === 0) {
                            // Timer completed
                            setIsActive(false);
                            handlePomodoroComplete();
                        } else {
                            setMinutes(minutes - 1);
                            setSeconds(59);
                        }
                    } else {
                        setSeconds(seconds - 1);
                    }
                } else {
                    // Count up mode for Stopwatch
                    if (seconds === 59) {
                        setMinutes(minutes + 1);
                        setSeconds(0);
                    } else {
                        setSeconds(seconds + 1);
                    }
                }
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, minutes, seconds, isPomodoroMode, handlePomodoroComplete]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        if (isPomodoroMode) {
            const settings =
                selectedPreset.name === 'Custom'
                    ? customSettings
                    : selectedPreset;
            setMinutes(settings.focus);
            setSeconds(0);
            setSessionType('focus');
            setPomodoroSession(0);
        } else {
            setMinutes(0);
            setSeconds(0);
        }
    };

    const applyTimerSettings = () => {
        setIsPomodoroMode(timerTab === 'focus');
        setIsActive(false);
        if (timerTab === 'focus') {
            const settings =
                selectedPreset.name === 'Custom'
                    ? customSettings
                    : selectedPreset;
            setMinutes(settings.focus);
            setSeconds(0);
            setSessionType('focus');
            setPomodoroSession(0);
        } else {
            setMinutes(0);
            setSeconds(0);
        }
        setShowTimerSettings(false);
    };

    const handleTaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && task.trim()) {
            const inputRect = inputRef.current?.getBoundingClientRect();
            const buttonRect = taskButtonRef.current?.getBoundingClientRect();

            if (inputRect && buttonRect) {
                setFlyingTask({
                    id: Date.now().toString(),
                    text: task.trim(),
                    startX: inputRect.left + inputRect.width / 2,
                    startY: inputRect.top + inputRect.height / 2,
                    endX: buttonRect.left + buttonRect.width / 2,
                    endY: buttonRect.top + buttonRect.height / 2,
                });

                setTimeout(() => {
                    const newTask: Task = {
                        id: Date.now().toString(),
                        text: task.trim(),
                        completed: false,
                    };
                    setTaskList([...taskList, newTask]);

                    toast.success('Task added to your list');
                    setFlyingTask(null);
                }, 600);
            }

            setTask('');
        }
    };

    const toggleTaskCompletion = (id: string) => {
        setTaskList(
            taskList.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task,
            ),
        );
    };

    const removeTask = (id: string) => {
        setTaskList(taskList.filter((task) => task.id !== id));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newTaskList = [...taskList];
        const draggedTask = newTaskList[draggedIndex];
        newTaskList.splice(draggedIndex, 1);
        newTaskList.splice(index, 0, draggedTask);

        setTaskList(newTaskList);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const toggleAmbientSound = (id: string) => {
        setAmbientSounds(
            ambientSounds.map((sound) =>
                sound.id === id ? { ...sound, enabled: !sound.enabled } : sound,
            ),
        );
    };

    const handleMusicLinkSubmit = () => {
        if (musicLink.trim()) {
            setSavedMusicLinks([...savedMusicLinks, musicLink.trim()]);
            toast.success('Music Link added');
            setMusicLink('');
        }
    };

    const removeMusicLink = (index: number) => {
        setSavedMusicLinks(savedMusicLinks.filter((_, i) => i !== index));
    };

    const selectBackgroundImage = (image: string) => {
        setBackgroundImage(image);
        setCustomBackgroundImage(null);
        toast.success('Background updated');
    };

    const handleCustomImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    setBackgroundImage(imageUrl);
                    setCustomBackgroundImage(imageUrl);
                    toast.success('Custom background updated');
                };
                reader.readAsDataURL(file);
            } else {
                toast.error('Please select the valid image type');
            }
        }
    };

    const formatLeaderboardDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const navigateLeaderboardDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(leaderboardDate);
        if (leaderboardPeriod === 'daily') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 1 : -1),
            );
        } else if (leaderboardPeriod === 'weekly') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 7 : -7),
            );
        } else {
            newDate.setMonth(
                newDate.getMonth() + (direction === 'next' ? 1 : -1),
            );
        }
        setLeaderboardDate(newDate);
    };

    const formatAnalyticsDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
        });
    };

    const navigateAnalyticsDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(analyticsDate);
        if (analyticsPeriod === 'today') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 1 : -1),
            );
        } else if (analyticsPeriod === 'week') {
            newDate.setDate(
                newDate.getDate() + (direction === 'next' ? 7 : -7),
            );
        } else {
            newDate.setMonth(
                newDate.getMonth() + (direction === 'next' ? 1 : -1),
            );
        }
        setAnalyticsDate(newDate);
    };

    if (isLoading || isFetching)
        return (
            <LoadingSpinner
                size="lg"
                className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2"
            />
        );

    if (!room)
        return (
            <div className="flex h-screen w-full items-center justify-center px-4">
                <EmptyState
                    title="Room Not Found"
                    description="We couldn’t find the room you’re looking for. It may have been deleted or is private."
                    icons={[DoorOpen, Users, KeyRound]}
                    action={{
                        label: 'Back to Rooms',
                        onClick: () => (window.location.href = '/rooms'),
                    }}
                    className="max-w-md border-zinc-700/50 bg-transparent text-white"
                />
            </div>
        );

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-slate-900/40" />
            </div>

            <AnimatePresence>
                {flyingTask && (
                    <motion.div
                        initial={{
                            position: 'fixed',
                            left: flyingTask.startX,
                            top: flyingTask.startY,
                            x: '-50%',
                            y: '-50%',
                            opacity: 1,
                            scale: 1,
                        }}
                        animate={{
                            left: flyingTask.endX,
                            top: flyingTask.endY,
                            opacity: 0,
                            scale: 0.5,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                            duration: 0.6,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className="pointer-events-none z-50 rounded-full border border-zinc-700/50 bg-zinc-800/90 px-4 py-2 backdrop-blur-xl"
                    >
                        <span className="text-sm font-medium text-white">
                            {flyingTask.text}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 h-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                    {displayMode === 'pomodoro' && (
                        <motion.div
                            key="pomodoro"
                            initial={{ x: '-100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <PomodoroDisplay
                                onLeaveRoom={onLeaveroom}
                                minutes={minutes}
                                seconds={seconds}
                                isActive={isActive}
                                isPomodoroMode={isPomodoroMode}
                                task={task}
                                setTask={setTask}
                                taskList={taskList}
                                pomodoroSession={pomodoroSession}
                                sessionType={sessionType}
                                toggleTimer={toggleTimer}
                                resetTimer={resetTimer}
                                handleTaskKeyDown={handleTaskKeyDown}
                                inputRef={inputRef}
                                taskButtonRef={taskButtonRef}
                                showTimerSettings={showTimerSettings}
                                setShowTimerSettings={setShowTimerSettings}
                                timerTab={timerTab}
                                setTimerTab={setTimerTab}
                                selectedPreset={selectedPreset}
                                setSelectedPreset={setSelectedPreset}
                                customSettings={customSettings}
                                setCustomSettings={setCustomSettings}
                                countUpTimer={countUpTimer}
                                setCountUpTimer={setCountUpTimer}
                                deepFocus={deepFocus}
                                setDeepFocus={setDeepFocus}
                                applyTimerSettings={applyTimerSettings}
                                toggleTaskCompletion={toggleTaskCompletion}
                                removeTask={removeTask}
                                handleDragStart={handleDragStart}
                                handleDragOver={handleDragOver}
                                handleDragEnd={handleDragEnd}
                                draggedIndex={draggedIndex}
                                showAmbientMixer={showAmbientMixer}
                                setShowAmbientMixer={setShowAmbientMixer}
                                ambientSounds={ambientSounds}
                                setAmbientSounds={setAmbientSounds}
                                toggleAmbientSound={toggleAmbientSound}
                                showMusicDialog={showMusicDialog}
                                setShowMusicDialog={setShowMusicDialog}
                                musicLink={musicLink}
                                setMusicLink={setMusicLink}
                                savedMusicLinks={savedMusicLinks}
                                handleMusicLinkSubmit={handleMusicLinkSubmit}
                                removeMusicLink={removeMusicLink}
                                showBackgroundSelector={showBackgroundSelector}
                                setShowBackgroundSelector={
                                    setShowBackgroundSelector
                                }
                                selectBackgroundImage={selectBackgroundImage}
                                handleCustomImageUpload={
                                    handleCustomImageUpload
                                }
                                customBackgroundImage={customBackgroundImage}
                                fileInputRef={fileInputRef}
                                backgroundImage={backgroundImage}
                                showLeaderboard={showLeaderboard}
                                setShowLeaderboard={setShowLeaderboard}
                                leaderboardPeriod={leaderboardPeriod}
                                setLeaderboardPeriod={setLeaderboardPeriod}
                                leaderboardDate={leaderboardDate}
                                formatLeaderboardDate={formatLeaderboardDate}
                                navigateLeaderboardDate={
                                    navigateLeaderboardDate
                                }
                                showAnalytics={showAnalytics}
                                setShowAnalytics={setShowAnalytics}
                                analyticsPeriod={analyticsPeriod}
                                setAnalyticsPeriod={setAnalyticsPeriod}
                                analyticsDate={analyticsDate}
                                formatAnalyticsDate={formatAnalyticsDate}
                                navigateAnalyticsDate={navigateAnalyticsDate}
                                room={room}
                                members={members}
                            />
                        </motion.div>
                    )}

                    {displayMode === 'ai-chat' && (
                        <motion.div
                            key="ai-chat"
                            initial={{ x: 0, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 0, opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0.2, 1, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <AIChatDisplay />
                        </motion.div>
                    )}

                    {displayMode === 'room' && (
                        <motion.div
                            key="room"
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <ChattingRoomDisplay />
                        </motion.div>
                    )}

                    {displayMode === 'collaboration' && (
                        <motion.div
                            key="collaboration"
                            initial={{ x: '-100%', opacity: 0 }} // Adjusted initial to match other exits
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0 }} // Adjusted exit to match other exits
                            transition={{
                                duration: 0.5,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="absolute inset-0"
                        >
                            <CollaborationDisplay />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="absolute right-6 bottom-6 z-20 flex items-center gap-2 rounded-2xl border border-zinc-700/50 bg-zinc-800/80 p-2 shadow-xl shadow-black/20 backdrop-blur-md">
                    <button
                        onClick={() => setDisplayMode('room')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'room'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <MessageSquare className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('ai-chat')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'ai-chat'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <Zap className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('collaboration')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'collaboration'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <MonitorPlay className="h-5 w-5 text-white" />
                    </button>
                    <button
                        onClick={() => setDisplayMode('pomodoro')}
                        className={`rounded-xl p-3 transition-all hover:scale-105 ${
                            displayMode === 'pomodoro'
                                ? 'bg-rose-400 shadow-lg shadow-rose-400/50'
                                : 'bg-zinc-700/50 hover:bg-zinc-600/50'
                        }`}
                    >
                        <Clock className="h-5 w-5 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
