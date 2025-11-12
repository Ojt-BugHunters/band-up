import z from 'zod';
import { Tag, TagSchema } from '../tag';
import { Comment } from '@/lib/api/dto/comment';

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

export const blogBaseSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z
        .string()
        .min(1, 'Content is required')
        .max(100_000, 'Content is too long'),
    topics: TagSchema.shape.topics,
});

export type CreateBlogFormValues = z.infer<typeof blogBaseSchema>;
