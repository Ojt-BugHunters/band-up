import { Tag } from './category';

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
    subContent: string; // sub string from content
    tags: Tag[];
    numberOfReaders: number;
    numberOfComments: number;
    publishedDate: string;
    reacts?: BlogReact[];
}

export interface BlogPostDetail {
    blogPost: BlogPost;
    content: string;
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
