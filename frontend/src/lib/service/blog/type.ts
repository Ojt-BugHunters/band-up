import { Tag } from '../tag';

export interface PaginationInfo {
    pageNo?: number;
    pageSize?: number;
    queryBy?: string;
    ascending?: boolean;
    tagId?: string;
}

export interface Author {
    id: string;
    name: string;
    avatar?: string;
}

export interface BlogPost {
    id: string;
    author: Author;
    title: string;
    titleImg?: string;
    tags: Tag[];
    numberOfReaders: number;
    numberOfComments: number;
    publishedDate: string;
    reacts?: BlogReact[];
    content?: string;
    comments: Comment[];
}

export type ReactType = 'like' | 'love' | 'sad' | 'angry' | 'haha' | 'wow';

export interface BlogReact {
    id: string;
    reactAuthor: Author;
    reactType: ReactType;
}
