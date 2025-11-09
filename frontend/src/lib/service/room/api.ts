import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { fetchWrapper, throwIfError } from '@/lib/api';
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
