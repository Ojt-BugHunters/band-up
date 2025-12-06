import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    useMutation,
    useQueries,
    useQuery,
    useQueryClient,
    UseQueryResult,
} from '@tanstack/react-query';
import { Resolver, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
    buildParams,
    deserialize,
    fetchWrapper,
    throwIfError,
} from '@/lib/service';
import {
    RoomSchema,
    CreateRoomFormValues,
    Room,
    StudySession,
    StopWatchTimerSettingValues,
    FocusCreateTimerSettingValues,
    FocusTimerFormSchema,
    FocusTimerFormValues,
    IntervalMutationPayload,
    AccountRoomMember,
    LearningStatsDay,
    LearningStatsMonth,
    LearningStatsYear,
    SessionOverviewStats,
    RoomStats,
    RoomAnalytics,
} from './type';
import type { StatsInterval } from '../stats';

export enum StudySessionStatus {
    PENDING = 'PENDING',
    ONGOING = 'ONGOING',
    ENDED = 'ENDED',
}

export function useCreateRoom() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof RoomSchema>) => {
            const response = await fetchWrapper('/rooms', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Create room failed');
        },
        onSuccess: (data: Room) => {
            toast.success('Room created successfully');
            queryClient.setQueryData(['room', data.id], data);
            router.push(`/room/${data.id}`);
        },
    });

    const form = useForm<CreateRoomFormValues>({
        resolver: zodResolver(RoomSchema),
        defaultValues: {
            roomName: '',
            description: '',
            privateRoom: false,
        },
    });

    return { form, mutation };
}

export const useGetPublicRooms = () => {
    return useQuery({
        queryFn: async () => {
            const response = await fetchWrapper(`/rooms/public`);
            return await deserialize<Room[]>(response);
        },
        queryKey: ['rooms'],
    });
};

export const useLeftRoom = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (roomId: string) => {
            const response = await fetchWrapper(`/rooms/${roomId}/leave`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Left room fail');
        },
        onSuccess: () => {
            toast.success('Left room successfully');
            queryClient.invalidateQueries({
                queryKey: ['room', 'room-member'],
            });
            router.push('/room');
        },
    });
    return mutation;
};

export function useJoinRoom() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (roomId: string) => {
            const response = await fetchWrapper(`/rooms/${roomId}/join`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Join room failed');
        },
        onSuccess: (data: Room) => {
            toast.success('Joined room successfully');
            queryClient.setQueryData(['room', data.id], data);
            router.push(`/room/${data.id}`);
        },
    });

    return mutation;
}

export const useGetRoomByCode = (roomCode: string | undefined) => {
    return useQuery({
        queryKey: ['room', roomCode],
        queryFn: async () => {
            if (!roomCode) {
                toast.error('Missing room code');
                throw new Error('Missing room code');
            }
            const response = await fetchWrapper(`/rooms/code/${roomCode}`);
            return await deserialize<Room>(response);
        },
        enabled: !!roomCode,
        staleTime: 10 * 60 * 1000,
    });
};

export const useGetRoomById = (roomId: string) => {
    const queryClient = useQueryClient();

    return useQuery({
        queryKey: ['room', roomId],
        queryFn: async () => {
            const response = await fetchWrapper(`/rooms/${roomId}`);
            return await deserialize<Room>(response);
        },
        initialData: () => queryClient.getQueryData<Room>(['room', roomId]),
        staleTime: 25 * 60 * 1000,
    });
};

export const useCheckUserInRoom = () => {
    return useQuery({
        queryKey: ['room'],
        queryFn: async () => {
            const response = await fetchWrapper('/rooms/check-user-in-room');
            return await deserialize<Room[]>(response);
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useCheckIfStudySession = (status: StudySessionStatus) => {
    return useQuery({
        queryKey: ['study-session'],
        queryFn: async () => {
            const response = await fetchWrapper(
                `/study-sessions/status/${status}`,
            );
            return await deserialize<StudySession[]>(response);
        },
        staleTime: 60 * 1000,
    });
};

export const useGetRoomMember = (userId: string) => {
    return useQuery({
        queryKey: ['room-member'],
        queryFn: async () => {
            const response = await fetchWrapper(`/profile/${userId}/avt-info`);
            return await deserialize<AccountRoomMember>(response);
        },
        staleTime: 10 * 60 * 1000,
    });
};

export const useGetStudySessions = (
    status: StudySessionStatus,
    roomId: string,
) => {
    return useQuery({
        queryKey: ['study-sessions', status, roomId],
        queryFn: async () => {
            const response = await fetchWrapper(
                `/study-sessions/status/${status}`,
            );
            return await deserialize<StudySession[]>(response);
        },
        staleTime: Infinity,
        refetchOnWindowFocus: true,
    });
};

export const useGetRoomMembers = (roomId: string) => {
    const { data: room, ...roomQuery } = useGetRoomById(roomId);

    const memberQueries: UseQueryResult<AccountRoomMember, Error>[] =
        useQueries({
            queries: (room?.members || []).map((m) => ({
                queryKey: ['room-member', m.userId],
                queryFn: async () => {
                    const response = await fetchWrapper(
                        `/profile/${m.userId}/avt-info`,
                    );
                    const data: AccountRoomMember = await response.json();
                    return data;
                },
                enabled: !!m.userId,
                staleTime: 1000 * 60 * 10,
            })),
        });

    const members = memberQueries
        .filter((q): q is UseQueryResult<AccountRoomMember> => !!q.data)
        .map((q, i) => ({
            id: room?.members?.[i]?.userId ?? '',
            name: q.data!.name,
            cloudFrontUrl: q.data!.cloudFrontUrl,
            expiresAt: q.data!.expiresAt,
        }));

    return {
        members,
        room,
        isLoading:
            roomQuery.isLoading || memberQueries.some((q) => q.isLoading),
        isError: roomQuery.isError || memberQueries.some((q) => q.isError),
    };
};

export const useCreateTimerSetting = (roomId: string) => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (
            values: FocusCreateTimerSettingValues | StopWatchTimerSettingValues,
        ) => {
            const response = await fetchWrapper(
                `/study-sessions/create?roomId=${roomId}`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                },
            );

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Create TimerSessions fail');
        },
        onSuccess: () => {
            toast.success('Create sessions successfully');
            queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
        },
    });

    const form = useForm<FocusTimerFormValues>({
        resolver: zodResolver(
            FocusTimerFormSchema,
        ) as Resolver<FocusTimerFormValues>,
        defaultValues: {
            focusTime: 25,
            shortBreak: 5,
            longBreak: 15,
            cycles: 4,
        },
    });

    return { form, mutation };
};

export function useStartInterval() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sessionId,
            intervalId,
        }: IntervalMutationPayload) => {
            const response = await fetchWrapper(
                `/study-sessions/${sessionId}/intervals/${intervalId}/start`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Start interval failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
        },
    });
}

export function usePingInterval() {
    return useMutation({
        mutationFn: async ({
            sessionId,
            intervalId,
        }: IntervalMutationPayload) => {
            const response = await fetchWrapper(
                `/study-sessions/${sessionId}/intervals/${intervalId}/ping`,
                {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Ping interval fail');
        },
        onSuccess: () => {
            toast.success('Ping interval successfully');
        },
    });
}

export function usePauseInterval() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sessionId,
            intervalId,
        }: IntervalMutationPayload) => {
            const response = await fetchWrapper(
                `/study-sessions/${sessionId}/intervals/${intervalId}/pause`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Pause interval failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
        },
    });
}

export function useEndInterval() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            sessionId,
            intervalId,
        }: IntervalMutationPayload) => {
            const response = await fetchWrapper(
                `/study-sessions/${sessionId}/intervals/${intervalId}/end`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'End interval failed');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['study-sessions'] });
        },
    });
}

export function useResumeInterval() {
    return useMutation({
        mutationFn: async ({
            sessionId,
            intervalId,
        }: IntervalMutationPayload) => {
            const response = await fetchWrapper(
                `/study-sessions/${sessionId}/intervals/${intervalId}/resume`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                    },
                },
            );
            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Resume interval fail');
        },
        onSuccess: () => {
            toast.success('Resume interval successfully');
        },
    });
}

export const useGetLearningStatsDay = (date: string | undefined) => {
    return useQuery({
        queryKey: ['learning-stats', 'day', date],
        enabled: !!date,
        queryFn: async () => {
            const params = buildParams({ date });
            const response = await fetchWrapper(
                `/stats/day?${params.toString()}`,
            );
            return await deserialize<LearningStatsDay>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetLearningStatsMonth = (
    year: number | undefined,
    month: number | undefined,
) => {
    return useQuery({
        queryKey: ['learning-stats', 'month', year, month],
        enabled: year != null && month != null,
        queryFn: async () => {
            const params = buildParams({ year, month });
            const response = await fetchWrapper(
                `/stats/month?${params.toString()}`,
            );
            return await deserialize<LearningStatsMonth>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetLearningStatsYear = (year: number | undefined) => {
    return useQuery({
        queryKey: ['learning-stats', 'year', year],
        enabled: year != null,
        queryFn: async () => {
            const params = buildParams({ year });
            const response = await fetchWrapper(
                `/stats/year?${params.toString()}`,
            );
            return await deserialize<LearningStatsYear>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetSessionOverviewStats = (date: string | undefined) => {
    return useQuery({
        queryKey: ['learning-stats', 'session-overview', date],
        enabled: !!date,
        queryFn: async () => {
            const params = buildParams({ date });
            const response = await fetchWrapper(
                `/stats/session-overview?${params.toString()}`,
            );
            return await deserialize<SessionOverviewStats>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetRoomStats = (
    statsInterval: StatsInterval = 'WEEKLY',
) => {
    const params = buildParams({ statsInterval });
    return useQuery({
        queryKey: ['room-stats', statsInterval],
        queryFn: async () => {
            const response = await fetchWrapper(
                `/rooms/stats?${params.toString()}`,
            );
            return await deserialize<RoomStats>(response);
        },
        staleTime: 5 * 60 * 1000,
    });
};

export const useGetTopRoomsAnalytics = () => {
    return useQuery({
        queryKey: ['room-analytics'],
        queryFn: async () => {
            const response = await fetchWrapper('/rooms/analytics');
            return await deserialize<RoomAnalytics[]>(response);
        },
        staleTime: 5 * 60 * 1000,
    });
};
