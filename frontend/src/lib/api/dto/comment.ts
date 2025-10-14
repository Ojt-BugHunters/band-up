import { Author } from './blog';

export interface Comment {
    id: string;
    content: string;
    author: Author;
    reply: Reply[];
    timestamp: string;
}

export interface Reply {
    id: string;
    content: string;
    author: Author;
    timestamp: string;
}
