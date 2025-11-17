import { Author } from '../blog';
import z from 'zod';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
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

export const TimerSettingSchema = z.object({
    roomId: z.string(),
    mode: z.string(),
    focusTime: z.number(),
    shortBreak: z.number(),
    longBreak: z.number(),
    cycles: z.number(),
});

export type CreateTimerSettingValues = z.infer<typeof TimerSettingSchema>;
