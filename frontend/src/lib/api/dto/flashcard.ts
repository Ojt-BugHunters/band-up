export interface Flashcard {
    id: string;
    title: string;
    description: string;
    author_name: string;
    number_learner: number;
    created_at: Date | string;
    is_public: boolean;
}

export interface FlashcardItem {
    id: string;
    front: string;
    back: string;
}
