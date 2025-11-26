import z from 'zod';

//----------Type and interface---------------------
export interface TaskResponse {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    createAt: string;
}

//----------Schema for react-hook-form-------------
export const TaskSchema = z.object({
    title: z.string().max(50, 'Max length of task name is 50 characters'),
});

export type CreateTaskFormValues = z.infer<typeof TaskSchema>;
