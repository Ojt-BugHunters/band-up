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
    learnerNumber: number;
    createdAt: string;
    authorName: string;
    public?: boolean;
    cards: Card[];
}
