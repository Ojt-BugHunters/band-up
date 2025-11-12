import z from 'zod';

export const sectionInputSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Max 200 chars'),
});

export const sectionFormSchema = z
    .object({
        section: z
            .array(sectionInputSchema)
            .min(1, 'At least one section')
            .max(4, 'Max 4 sections'),
    })
    .transform(({ section }) => ({
        section: section.map((s, i) => ({ title: s.title, orderIndex: i + 1 })),
    }));

export type CreateFullSectionFormInput = z.input<typeof sectionFormSchema>;
export type CreateFullSectionPayload = z.output<typeof sectionFormSchema>;

export interface Dictation {
    id: string;
    title: string;
    duration: number;
    difficulty: 'Easy';
    completions: number;
    createdAt: Date;
}

export interface DictationSection {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
    timeLimitSeconds: number;
    metatdata: string;
}

export interface DictationQuestion {
    id: string;
    sectionId: string;
    type: string;
    content: {
        additionalProp1: string;
        additionalProp2: string;
        additionalProp3: string;
    };
    difficult: string;
    isActive: boolean;
    uploadUrl: string;
    key: string;
    script: string;
    createdAt: Date;
}

export type DictationAudio = {
    id: string;
    title: string;
    duration: string;
    url: string;
};

export type Section = {
    id: string;
    title: string;
    audioFiles: DictationAudio[];
};

export type MappedQuestion = {
    sectionId: string;
    sectionIndex: number;
    difficult: number;
    type: string;
    file: File;
    script: string;
};

export type CreateDictationQuestionReq = {
    difficult: number | string;
    type: string;
    fileName: string;
    script: string;
    contentType: string;
};

export type CreateQuestionRes = {
    id: string;
    sectionId: string;
    type: string;
    difficult: number | string;
    uploadUrl: string;
    key: string;
    script: string;
    createdAt: string;
};

export const TestCreateSchema = z.object({
    skillName: z.string().min(1, 'Skill name is required'),
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title is too long'),
    durationSeconds: z.number(),
});
export type TestCreateFormValues = z.infer<typeof TestCreateSchema>;
