import z from 'zod';

export interface Deck {
    id: string;
    title: string;
    description: string;
    learnerNumber: number;
    createdAt: string;
    authorName: string;
    public?: boolean;
}
export interface Card {
    id: string;
    front: string;
    back: string;
}

export interface DeckCard {
    id: string;
    title: string;
    description: string;
    authorId?: string;
    learnerNumber: number;
    createdAt: string;
    authorName: string;
    public?: boolean;
    cards: Card[];
}

export interface FlashCardData {
    totalCards: number;
    totalDecks: number;
    totalLearners: number;
}

export interface PaginationInfo {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    ascending?: boolean;
    queryBy?: string;
    visibility?: '' | 'public' | 'private';
    isLearned?: boolean;
}

export const deckPasswordSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export const baseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    cards: z
        .array(
            z.object({
                front: z.string().min(1, 'Front side is required'),
                back: z.string().min(1, 'Back side is required'),
            }),
        )
        .min(1, 'At least one card is required'),
    public: z.boolean(),
    password: z.string().optional(),
});

export type CreateDeckFormValues = z.infer<typeof baseSchema>;
