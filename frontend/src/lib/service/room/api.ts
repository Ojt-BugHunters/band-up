import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { deserialize, fetchWrapper, throwIfError } from '@/lib/api';
import { RoomSchema, CreateRoomFormValues, Room } from './type';

export function useCreateRoom() {
    const router = useRouter();

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
            router.push(`/room/${data.id}`);
        },
    });

    const form = useForm<CreateRoomFormValues>({
        resolver: zodResolver(RoomSchema),
        defaultValues: {
            roomName: '',
            description: '',
            private: false,
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

export function useJoinRoom() {
    const router = useRouter();

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
