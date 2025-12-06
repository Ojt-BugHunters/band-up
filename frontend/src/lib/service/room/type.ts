import { Author } from '../blog';
import z from 'zod';
import type { StatsInterval } from '../stats';
export type { StatsInterval } from '../stats';

export interface TimerSettings {
    focus: number;
    shortBreak: number;
    longBreak: number;
    cycle: number;
}

export interface AccountRoomMember {
    id: string;
    name: string;
    cloudFrontUrl: string;
    expiresAt: string;
}

export interface AmbientSound {
    id: string;
    name: string;
    icon: string;
    category: 'weather' | 'nature' | 'ambiance' | 'workspace';
    enabled: boolean;
    volume: number;
}

export interface LeaderboardUser {
    rank: number;
    username: string;
    avatar: string;
    studyTime: string;
    rankChange?: 'up' | 'down' | null;
    country?: string;
    status?: string;
}

export interface RoomInfo {
    roomName: string;
    roomOwner: Author;
}

export type PomodoroPreset = {
    name: string;
    focus: number;
    shortBreak: number;
    longBreak: number;
    cycle: number;
};

export interface RoomMember {
    roomId: string;
    userId: string;
    role: string;
    joinedAt: string;
}

export interface Room {
    id: string;
    roomName: string;
    description: string;
    roomCode: string;
    isPrivate: boolean;
    createdBy: string;
    numberOfMembers: number;
    createdAt: string;
    members: RoomMember[];
}

export interface Interval {
    id: string;
    studySessionId: string;
    type: string;
    orderIndex: number;
    startedAt: string;
    endedAt: string;
    pingedAt: string;
    duration: number;
    status: string;
}

export interface StudySession {
    id: string;
    userId: string;
    roomId: string;
    mode: string;
    focusTime: number;
    shortBreak: number;
    longBreak: number;
    cycles: number;
    startedAt: string;
    endedAt: string;
    status: string;
    createdAt: string;
    totalFocusTime: number;
    interval: Interval[];
}

export interface LearningStatsDay {
    date: string;
    totalMinutes: number;
    hourlyMinutes: number[];
}

export interface LearningStatsMonth {
    year: number;
    month: number;
    totalMinutes: number;
    dailyMinutes: number[];
}

export interface LearningStatsYear {
    year: number;
    totalMinutes: number;
    monthlyMinutes: number[];
}

export interface SessionOverviewStats {
    totalSessions: number;
    focusedTime: number;
    bestSession: number;
    taskCompleted: number;
}

export interface RoomStats {
    totalRooms: number;
    totalRoomsDifference: number;
    publicRooms: number;
    publicRoomsDifference: number;
    privateRooms: number;
    privateRoomsDifference: number;
    activeMembers: number;
    activeMembersDifference: number;
    statsInterval: StatsInterval;
}

export type IntervalMutationPayload = {
    sessionId: string;
    intervalId: string;
};

// --------------------- Schema for react-hook-form-----------
export const RoomSchema = z.object({
    roomName: z.string().max(50, 'Max length of room name is 50 characters'),
    description: z
        .string()
        .transform((v) =>
            v?.trim().length ? v : 'A cozy room for learning and working',
        ),
    privateRoom: z.boolean(),
});

export type CreateRoomFormValues = z.infer<typeof RoomSchema>;

export const FocusTimerFormSchema = z.object({
    focusTime: z.coerce.number(),
    shortBreak: z.coerce.number(),
    longBreak: z.coerce.number(),
    cycles: z.coerce.number(),
});

export type FocusTimerFormValues = z.infer<typeof FocusTimerFormSchema>;

export const FocusTimerSettingSchema = z.object({
    mode: z.literal('FocusTimer'),
    focusTime: z.number(),
    shortBreak: z.number(),
    longBreak: z.number(),
    cycles: z.number(),
});

export type FocusCreateTimerSettingValues = z.infer<
    typeof FocusTimerSettingSchema
>;

export const StopWatchSettingSchema = z.object({
    mode: z.literal('StopWatch'),
});

export type StopWatchTimerSettingValues = z.infer<
    typeof StopWatchSettingSchema
>;
