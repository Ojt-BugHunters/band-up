export interface DictationDTO {
    id: string;
    title: string;
    duration: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    completions: number;
    createdAt: Date;
}
