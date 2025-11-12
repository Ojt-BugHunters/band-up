import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { deserialize, fetchWrapper } from '@/lib/api';
import { Tag } from '@/lib/api/dto/category';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(input: string) {
    const d = new Date(input);
    return isNaN(d.getTime())
        ? input
        : d.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          });
}

export async function fetchTagsApi(keyword = ''): Promise<Tag[]> {
    const q = keyword.trim();
    const url = q ? `/blog/tags?query=${encodeURIComponent(q)}` : '/blog/tags';
    const res = await fetchWrapper(url);
    return deserialize<Tag[]>(res);
}
