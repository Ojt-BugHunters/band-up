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

export const dictationQuestionSchema = z.object({
    questions: z
        .array(
            z.object({
                sectionIndex: z.number(),
                difficult: z.number(),
                type: z.string(),
                file: z
                    .instanceof(File, { message: 'Audio file is required' })
                    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max 5MB'),
                script: z.string().min(1, 'Script is required'),
            }),
        )
        .min(1, 'At least one question is required'),
});

export type CreateFullSectionFormInput = z.input<typeof sectionFormSchema>;

export type CreateFullSectionPayload = z.output<typeof sectionFormSchema>;

export type DictationQuestionFormData = z.infer<typeof dictationQuestionSchema>;

export interface createPassageParams {
    payload: CreateFullSectionPayload;
    testId: string;
}
export interface Dictation {
    userId: string;
    id: string;
    title: string;
    skillName: string;
    numberOfPeople: number | null;
    durationSeconds: number;
    difficult: string;
    createAt: string;
}

export interface DictationSection {
    id: string;
    testId: string;
    title: string;
    orderIndex: number;
}

export interface DictationQuestion {
    id: string;
    sectionId: string;
    type: string;
    difficult: string;
    script: string;
    cloudfrontUrl: string;
}

export interface DictationSentence {
    id: number;
    text: string;
    words: string[];
}

export interface DictationPracticeScript {
    id: string;
    audioUrl: string;
    title: string;
    sentences: DictationSentence[];
}

export interface DictationSectionQuestion extends DictationSection {
    questions: DictationQuestion[];
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
    difficult: z.string(),
});
export type TestCreateFormValues = z.infer<typeof TestCreateSchema>;

export type WordComparisonItem =
    | {
          word: string;
          status: 'untyped';
      }
    | {
          word: string;
          userWord: string;
          status: 'correct' | 'incorrect';
      };

export type WordComparison = WordComparisonItem[];
