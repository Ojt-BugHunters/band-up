import { useMutation, useQuery } from '@tanstack/react-query';
import z from 'zod';
import { CreateTaskFormValues, TaskResponse, TaskSchema } from './type';
import { fetchWrapper, throwIfError, deserialize } from '..';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function useCreateTask() {
    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof TaskSchema>) => {
            const response = await fetchWrapper('/tasks/create', {
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
            toast.error(error?.message ?? 'Create new task failed');
        },
        onSuccess: () => {
            toast.success('Task created successfully');
        },
    });

    const form = useForm<CreateTaskFormValues>({
        resolver: zodResolver(TaskSchema),
        defaultValues: {
            title: '',
        },
    });

    return { form, mutation };
}

export function useUpdateTask(taskId: string) {
    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof TaskSchema>) => {
            const response = await fetchWrapper(`/tasks/${taskId}`, {
                method: 'PUT',
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
            toast.error(error?.message ?? 'Update task failed');
        },
        onSuccess: () => {
            toast.success('Task updated successfully');
        },
    });

    const form = useForm<CreateTaskFormValues>({
        resolver: zodResolver(TaskSchema),
        defaultValues: {
            title: '',
        },
    });

    return { form, mutation };
}

export function useDeleteTask(taskId: string) {
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await fetchWrapper(`/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Delete task failed');
        },
        onSuccess: () => {
            toast.success('Delete updated successfully');
        },
    });

    return { mutation };
}

export function useToggleTask(taskId: string) {
    const mutation = useMutation({
        mutationFn: async () => {
            const response = await fetchWrapper(`/tasks/${taskId}/toggle`, {
                method: 'PATCH',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            await throwIfError(response);
            return response.json();
        },
        onError: (error) => {
            toast.error(error?.message ?? 'Toggle task failed');
        },
        onSuccess: () => {
            toast.success('Toggle updated successfully');
        },
    });

    return { mutation };
}

export const useGetAllTasks = () => {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async () => {
            const response = await fetchWrapper('/tasks');
            return await deserialize<TaskResponse[]>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetAllTasksToday = () => {
    return useQuery({
        queryKey: ['task', 'today'],
        queryFn: async () => {
            const response = await fetchWrapper('/tasks/today');
            return await deserialize<TaskResponse[]>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetAllTasksIncomplete = () => {
    return useQuery({
        queryKey: ['task', 'incomplete'],
        queryFn: async () => {
            const response = await fetchWrapper('/tasks/incomplete');
            return await deserialize<TaskResponse[]>(response);
        },
        staleTime: 10 * 1000,
    });
};

export const useGetAllTasksCompleted = () => {
    return useQuery({
        queryKey: ['task', 'completed'],
        queryFn: async () => {
            const response = await fetchWrapper('/tasks/completed');
            return await deserialize<TaskResponse[]>(response);
        },
        staleTime: 10 * 1000,
    });
};
