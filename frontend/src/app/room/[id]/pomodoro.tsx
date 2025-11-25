'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { BarChart3, Clock, Grid3x3, ListTodo } from 'lucide-react';
import { TimerControlDialog } from './timer-dialog';
import { MusicMixer } from './music-mixer';
import { PlayMusicWithLink } from './music-add-link';
import { BackgroundImage } from './background-image';
import { ToDoListBox } from './to-do-list';
import { LeaderBoard } from './leaderboard';
import { AnalyticComponent } from './analytic-dialog';
import {
    AmbientSound,
    FocusTimerFormValues,
    PomodoroPreset,
} from '@/lib/service/room';
import { RefObject } from 'react';
import { TimePeriod } from './page';
import { RoomMenuDialog } from './room-menu';
import { Room } from '@/lib/service/room';
import { AccountRoomMember } from '@/lib/service/room';
import { UseFormReturn } from 'react-hook-form';
import { TaskResponse } from '@/lib/service/task';
export type DisplayMode = 'pomodoro' | 'ai-chat' | 'room' | 'collaboration';
export type SessionType = 'focus' | 'shortBreak' | 'longBreak';
export type TimerTab = 'focus' | 'stopwatch';
export type AnalyticsPeriod = 'today' | 'week' | 'month';

export interface PomodoroDisplayProps {
    // room menu dialog
    roomMenuDialogOpen: boolean;
    setRoomMenuDialogOpen: (show: boolean) => void;
    // Core timer
    minutes: number;
    seconds: number;
    isPomodoroMode: boolean;
    pomodoroSession: number;
    sessionType: SessionType;
    draggedIndex: number | null;
    totalSteps: number;
    currentStep: number;

    // Task system
    task: string;
    setTask: (task: string) => void;
    taskList: TaskResponse[];
    handleTaskKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    toggleTaskCompletion: (id: string) => void;
    removeTask: (id: string) => void;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;

    // Timer settings
    showTimerSettings: boolean;
    setShowTimerSettings: (show: boolean) => void;
    timerTab: TimerTab;
    setTimerTab: (tab: TimerTab) => void;
    selectedPreset: PomodoroPreset;
    setSelectedPreset: (preset: PomodoroPreset) => void;
    form: UseFormReturn<FocusTimerFormValues>;
    handleApplyTimerSettings: () => void;
    toggleTimer: () => void;
    canToggleTimer: boolean;
    isActive: boolean;

    // Ambient sounds
    showAmbientMixer: boolean;
    setShowAmbientMixer: (show: boolean) => void;
    ambientSounds: AmbientSound[];
    setAmbientSounds: (sounds: AmbientSound[]) => void;
    toggleAmbientSound: (id: string) => void;

    // Music player
    showMusicDialog: boolean;
    setShowMusicDialog: (show: boolean) => void;
    musicLink: string;
    setMusicLink: (link: string) => void;
    savedMusicLinks: string[];
    handleMusicLinkSubmit: () => void;
    removeMusicLink: (index: number) => void;

    // Background selector
    showBackgroundSelector: boolean;
    setShowBackgroundSelector: (show: boolean) => void;
    selectBackgroundImage: (image: string) => void;
    handleCustomImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    customBackgroundImage: string | null;
    fileInputRef: RefObject<HTMLInputElement | null>;
    backgroundImage: string;

    // Leaderboard
    showLeaderboard: boolean;
    setShowLeaderboard: (show: boolean) => void;
    leaderboardPeriod: TimePeriod;
    setLeaderboardPeriod: (p: TimePeriod) => void;
    leaderboardDate: Date;
    formatLeaderboardDate: (date: Date) => string;
    navigateLeaderboardDate: (direction: 'prev' | 'next') => void;

    // Analytics
    showAnalytics: boolean;
    setShowAnalytics: (show: boolean) => void;
    analyticsPeriod: AnalyticsPeriod;
    setAnalyticsPeriod: (period: AnalyticsPeriod) => void;
    analyticsDate: Date;
    formatAnalyticsDate: (date: Date) => string;
    navigateAnalyticsDate: (direction: 'prev' | 'next') => void;

    // Refs
    inputRef: RefObject<HTMLDivElement | null>;
    taskButtonRef: RefObject<HTMLButtonElement | null>;

    // room
    room: Room;
    members: AccountRoomMember[];
    onLeaveRoom: () => void;
}

export function PomodoroDisplay({
    // room menu
    roomMenuDialogOpen,
    setRoomMenuDialogOpen,
    members,
    room,
    onLeaveRoom,
    // task props
    task,
    setTask,
    handleTaskKeyDown,
    inputRef,
    // to do list box
    taskList,
    taskButtonRef,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    toggleTaskCompletion,
    removeTask,
    draggedIndex,
    // timer control dialog
    showTimerSettings,
    setShowTimerSettings,
    timerTab,
    setTimerTab,
    selectedPreset,
    setSelectedPreset,
    form,
    handleApplyTimerSettings,
    toggleTimer,
    canToggleTimer,
    isActive,
    minutes,
    seconds,
    isPomodoroMode,

    totalSteps,
    currentStep,

    showAmbientMixer,
    setShowAmbientMixer,
    ambientSounds,
    setAmbientSounds,
    toggleAmbientSound,
    showMusicDialog,
    setShowMusicDialog,
    musicLink,
    setMusicLink,
    savedMusicLinks,
    handleMusicLinkSubmit,
    removeMusicLink,
    showBackgroundSelector,
    setShowBackgroundSelector,
    selectBackgroundImage,
    handleCustomImageUpload,
    customBackgroundImage,
    fileInputRef,
    backgroundImage,
    showLeaderboard,
    setShowLeaderboard,
    leaderboardPeriod,
    setLeaderboardPeriod,
    leaderboardDate,
    formatLeaderboardDate,
    navigateLeaderboardDate,
    showAnalytics,
    setShowAnalytics,
    analyticsPeriod,
    setAnalyticsPeriod,
    analyticsDate,
    formatAnalyticsDate,
    navigateAnalyticsDate,
}: PomodoroDisplayProps) {
    return (
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 shadow-lg shadow-black/20 backdrop-blur-md">
                        <Clock className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white drop-shadow-lg">
                        BandUp IELTS
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAnalytics(true)}
                        className="relative flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
                    >
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full opacity-30"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 40%, transparent 80%)',
                            }}
                        />
                        <Clock className="relative z-10 h-4 w-4 text-white" />
                        <span className="relative z-10 text-sm font-bold text-white">
                            0 mins
                        </span>
                    </button>

                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
                    >
                        <BarChart3 className="relative z-10 h-5 w-5 text-white" />
                    </button>

                    <>
                        <div
                            className="relative flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl"
                            onClick={() => setRoomMenuDialogOpen(true)}
                        >
                            <span className="relative z-10 text-sm font-bold text-white">
                                {room?.roomName} rooms
                            </span>
                        </div>

                        <RoomMenuDialog
                            open={roomMenuDialogOpen}
                            onOpenChange={setRoomMenuDialogOpen}
                            roomName={`${room?.roomName ?? 'Unknown'}'s room`}
                            description={
                                room?.description ?? 'No description yet'
                            }
                            isPrivate={room?.isPrivate ?? false}
                            roomId={room?.id ?? ''}
                            members={members}
                            onSave={(data) => console.log('Updated:', data)}
                            onLeave={onLeaveRoom}
                        />
                    </>
                    <Avatar className="relative h-10 w-10 border-2 border-white/10 bg-black/40 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-105 hover:bg-black/50">
                        <AvatarFallback className="bg-transparent font-bold text-white">
                            ND
                        </AvatarFallback>
                    </Avatar>
                </div>
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6">
                {isPomodoroMode && totalSteps > 0 && (
                    <div className="flex gap-3">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-4 w-4 rounded-full transition-all ${
                                    index <= currentStep
                                        ? 'bg-white shadow-xl shadow-white/50'
                                        : 'bg-white/30 shadow-md shadow-black/10 backdrop-blur-md'
                                }`}
                            />
                        ))}
                    </div>
                )}

                <div className="text-center">
                    <div className="text-[120px] leading-none font-extrabold text-white drop-shadow-2xl md:text-[180px]">
                        {String(minutes).padStart(2, '0')}:
                        {String(seconds).padStart(2, '0')}
                    </div>
                </div>
                <div
                    ref={inputRef}
                    className="relative flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all focus-within:ring-2 focus-within:ring-white/15 hover:bg-black/50"
                >
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 40%, transparent 80%)',
                        }}
                    />

                    <Grid3x3 className="relative z-10 h-5 w-5 text-white/80" />

                    <Input
                        type="text"
                        placeholder="What are you working on?"
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                        onKeyDown={handleTaskKeyDown}
                        className="relative z-10 flex-1 border-0 bg-transparent p-0 font-medium text-white shadow-none placeholder:text-white/70 focus:ring-0 focus:outline-none focus-visible:ring-0"
                    />
                </div>
                {(() => {
                    const firstActiveTask = taskList.find((t) => !t.completed);

                    if (!firstActiveTask) return null;

                    return (
                        <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-6 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:bg-black/50">
                            <span
                                aria-hidden
                                className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
                                style={{
                                    background:
                                        'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.05) 40%, transparent 80%)',
                                }}
                            />
                            <ListTodo className="relative z-10 h-4 w-4 text-white/80" />
                            <span className="relative z-10 text-sm font-semibold text-white">
                                {firstActiveTask.title}
                            </span>
                        </div>
                    );
                })()}

                <TimerControlDialog
                    showTimerSettings={showTimerSettings}
                    setShowTimerSettings={setShowTimerSettings}
                    timerTab={timerTab}
                    setTimerTab={setTimerTab}
                    selectedPreset={selectedPreset}
                    setSelectedPreset={setSelectedPreset}
                    form={form}
                    handleApplyTimerSettings={handleApplyTimerSettings}
                    toggleTimer={toggleTimer}
                    canToggleTimer={canToggleTimer}
                    isActive={isActive}
                />
            </main>
            <footer className="flex items-center justify-between p-6">
                <div className="flex items-center gap-2">
                    <MusicMixer
                        showAmbientMixer={showAmbientMixer}
                        setShowAmbientMixer={setShowAmbientMixer}
                        ambientSounds={ambientSounds}
                        setAmbientSounds={setAmbientSounds}
                        toggleAmbientSound={toggleAmbientSound}
                    />
                    <PlayMusicWithLink
                        showMusicDialog={showMusicDialog}
                        setShowMusicDialog={setShowMusicDialog}
                        musicLink={musicLink}
                        setMusicLink={setMusicLink}
                        savedMusicLinks={savedMusicLinks}
                        handleMusicLinkSubmit={handleMusicLinkSubmit}
                        removeMusicLink={removeMusicLink}
                    />
                    <BackgroundImage
                        ref={fileInputRef}
                        showBackgroundSelector={showBackgroundSelector}
                        setShowBackgroundSelector={setShowBackgroundSelector}
                        selectBackgroundImage={selectBackgroundImage}
                        backgroundImage={backgroundImage}
                        customBackgroundImage={customBackgroundImage}
                        handleCustomImageUpload={handleCustomImageUpload}
                    />
                    <ToDoListBox
                        ref={taskButtonRef}
                        taskList={taskList}
                        draggedIndex={draggedIndex}
                        handleDragStart={handleDragStart}
                        handleDragOver={handleDragOver}
                        handleDragEnd={handleDragEnd}
                        toggleTaskCompletion={toggleTaskCompletion}
                        removeTask={removeTask}
                    />
                </div>
            </footer>
            <LeaderBoard
                showLeaderboard={showLeaderboard}
                setShowLeaderboard={setShowLeaderboard}
                leaderboardPeriod={leaderboardPeriod}
                setLeaderboardPeriod={setLeaderboardPeriod}
                navigateLeaderboardDate={navigateLeaderboardDate}
                leaderboardDate={leaderboardDate}
                formatLeaderboardDate={formatLeaderboardDate}
            />
            <AnalyticComponent
                analyticsDate={analyticsDate}
                showAnalytics={showAnalytics}
                setShowAnalytics={setShowAnalytics}
                analyticsPeriod={analyticsPeriod}
                setAnalyticsPeriod={setAnalyticsPeriod}
                navigateAnalyticsDate={navigateAnalyticsDate}
                formatAnalyticsDate={formatAnalyticsDate}
            />{' '}
        </div>
    );
}
