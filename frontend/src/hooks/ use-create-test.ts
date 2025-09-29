import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const basePassageSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    image: z.string().optional(),
});

const baseQuestionSchema = z.object({
    title: z.string().min(1, 'Question title is required'),
    content: z.string().min(1, 'Question content is required'),
    image: z.string().optional(),
});

export const testTypeSchema = z.object({
    testType: z.enum(['reading', 'writing', 'listening', 'speaking'] as const),
});

export const readingPassageSchema = basePassageSchema;

export const readingQuestionSchema = baseQuestionSchema.extend({
    type: z.enum([
        'multiple-choice',
        'short-answer',
        'true-false',
        'completion',
    ] as const),
    passageId: z.string(),
});

export const readingDataSchema = z.object({
    passages: z
        .array(readingPassageSchema)
        .min(3, 'Reading test requires exactly 3 passages')
        .max(3, 'Reading test requires exactly 3 passages'),
    questions: z
        .array(readingQuestionSchema)
        .min(1, 'At least one question is required'),
});

export const listeningPassageSchema = z.object({
    id: z.string(),
    audioFile: z.instanceof(File).nullable(),
    title: z.string().min(1, 'Title is required'),
});

export const listeningQuestionSchema = baseQuestionSchema.extend({
    type: z.enum(['multiple-choice', 'completion', 'true-false'] as const),
    passageId: z.string(),
});

export const listeningDataSchema = z.object({
    passages: z
        .array(listeningPassageSchema)
        .min(4, 'Listening test requires exactly 4 passages')
        .max(4, 'Listening test requires exactly 4 passages'),
    questions: z
        .array(listeningQuestionSchema)
        .min(1, 'At least one question is required'),
});

export const writingPassageSchema = basePassageSchema;

export const writingQuestionSchema = baseQuestionSchema.extend({
    type: z.enum(['task1', 'task2'] as const),
    passageId: z.string(),
});

export const writingDataSchema = z.object({
    passages: z
        .array(writingPassageSchema)
        .min(2, 'Writing test requires exactly 2 passages')
        .max(2, 'Writing test requires exactly 2 passages'),
    questions: z
        .array(writingQuestionSchema)
        .min(1, 'At least one question is required'),
});

export const speakingSectionSchema = z.object({
    id: z.string(),
    part: z.enum(['part1', 'part23'] as const),
    questions: z
        .array(z.string().min(1, 'Question cannot be empty'))
        .min(1, 'At least one question is required'),
});

export const speakingDataSchema = z.object({
    sections: z
        .array(speakingSectionSchema)
        .min(3, 'Speaking test requires exactly 3 parts')
        .max(3, 'Speaking test requires exactly 3 parts'),
});

export const testCreationSchema = z.object({
    testType: z.enum(['reading', 'writing', 'listening', 'speaking'] as const),
    readingData: readingDataSchema.optional(),
    listeningData: listeningDataSchema.optional(),
    writingData: writingDataSchema.optional(),
    speakingData: speakingDataSchema.optional(),
});

export const useCreateTest = () => {
    const form = useForm({
        resolver: zodResolver(testCreationSchema),
        defaultValues: {
            testType: undefined,
            readingData: undefined,
            listeningData: undefined,
            writingData: undefined,
            speakingData: undefined,
        },
    });

    return {
        form,
    };
};
