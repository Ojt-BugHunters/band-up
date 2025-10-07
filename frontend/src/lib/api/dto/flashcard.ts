export interface Deck {
    id: string;
    title: string;
    description: string;
    learnerNumber: number;
    createdAt: string;
    authorName: string;
    public?: boolean;
}
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
