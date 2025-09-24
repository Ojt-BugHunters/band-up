export interface Question {
    id: number;
    type: 'multiple-choice' | 'short-answer' | 'true-false' | 'completion';
    question: string;
    options?: string[];
    answer: string;
    image?: string;
}
