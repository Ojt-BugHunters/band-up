import { Author } from './blog';

export interface Comment {
    id: string;
    content: string;
    author: Author;
    reply: Reply[];
}

export interface Reply {
    id: string;
    content: string;
    author: Author;
}
