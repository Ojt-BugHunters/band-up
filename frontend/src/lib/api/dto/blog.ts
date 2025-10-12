export interface Author {
    id: string;
    name: string;
    avatar: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Post {
    id: string;
    author: Author;
    title: string;
    content: string;
    coverImage: string;
    tag: Tag[];
    reactions: number;
    comments: number;
    publishedAt: string;
}
