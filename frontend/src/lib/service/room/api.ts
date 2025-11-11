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
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { deserialize, fetchWrapper, throwIfError } from '@/lib/api';
import { RoomSchema, CreateRoomFormValues, Room } from './type';
import { AccountRoomMember } from '../account';

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
    });
};

export const useCheckUserInRoom = () => {
    return useQuery({
        queryKey: ['room'],
        queryFn: async () => {
            const response = await fetchWrapper('/rooms/check-user-in-room');
            return await deserialize<Room[]>(response);
        },
    });
};

export const useGetRoomMember = (userId: string) => {
    return useQuery({
        queryKey: ['room-member'],
        queryFn: async () => {
            const response = await fetchWrapper(`/profile/${userId}/avt-info`);
            return await deserialize<AccountRoomMember>(response);
        },
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
