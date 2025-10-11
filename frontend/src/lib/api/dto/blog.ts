import { Tag } from './category';

export interface FeatureBlogs {
    id: string;
    title: string;
    summary: string;
    category: string;
    image: string;
    numberOfReader: number;
}

export interface BlogPosts {
    id: string;
    title: string;
    summary: string;
    image: string;
    author: string;
    publishDate: string;
    numberOfReader: number;
    comments: number;
    category: Tag[];
}

export interface CreateBlog {
    title: string;
    summary: string;
    content: string;
    category: Tag[];
}

export interface BlogPost {
    // cac field giong BlogPosts o tren
    // them 1 field nay
    content: string;
}
