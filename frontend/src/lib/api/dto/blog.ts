import { Tag } from './category';
import { Comment } from './comment';

export type ReactType = 'like' | 'love' | 'sad' | 'angry' | 'haha' | 'wow';

export interface BlogReact {
    id: string;
    reactAuthor: Author;
    reactType: ReactType;
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

export interface FeatureBlogs {
    id: string;
    title: string;
    subContent: string;
    tags: Tag[];
    image: string;
    numberOfReader: number;
    numberOfComments: number;
}
