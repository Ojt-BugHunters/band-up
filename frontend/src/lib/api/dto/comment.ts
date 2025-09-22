export interface Comment {
    id: string;
    content: string;
    author_name: string;
    reply: Reply[];
}

export interface Reply {
    id: string;
    content: string;
    author_name: string;
}
