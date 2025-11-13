import z from 'zod';

// --------------------Type and Interface-----------------------
export interface Tag {
    id: string;
    name: string;
}

// --------------------Schema for react-hook-form-----------------------
export const TagSchema = z.object({
    topics: z.array(
        z.object({
            id: z.string(),
            text: z.string(),
        }),
    ),
});

export type TagSchemaType = z.infer<typeof TagSchema>;
