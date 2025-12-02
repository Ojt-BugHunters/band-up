import z from 'zod';

export interface Tag {
    name: string;
}

export const TagSchema = z.object({
    topics: z.array(
        z.object({
            text: z.string(),
        }),
    ),
});

export type TagSchemaType = z.infer<typeof TagSchema>;
