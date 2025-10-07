export interface Flashcard {
    id: string;
    title: string;
    description: string;
    author_name: string;
    number_learner: number;
    created_at: Date | string;
    is_public: boolean;
}

export interface DeckApiResponse {
    id: string;
    title: string | null;
    description: string | null;
    learnerNumber: number | null;
    createdAt: string | null;
    authorName: string | null;
    public?: boolean;
    isPublic?: boolean;
}

export const mapDeckToFlashcard = (deck: DeckApiResponse): Flashcard => {
    const isPublic = deck.isPublic ?? deck.public ?? false;

    return {
        id: deck.id,
        title: deck.title ?? 'Untitled deck',
        description: deck.description ?? '',
        author_name: deck.authorName ?? 'Unknown author',
        number_learner: deck.learnerNumber ?? 0,
        created_at: deck.createdAt ?? new Date().toISOString(),
        is_public: isPublic,
    };
};

export interface CardApiResponse {
    id: string;
    front: string | null;
    back: string | null;
}

export const mapCardToFlashcardItem = (
    card: CardApiResponse,
): FlashcardItem => ({
    id: card.id,
    front: card.front ?? '',
    back: card.back ?? '',
});

export interface FlashcardItem {
    id: string;
    front: string;
    back: string;
}
