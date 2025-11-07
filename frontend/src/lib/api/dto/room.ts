import { Author } from './blog';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
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
