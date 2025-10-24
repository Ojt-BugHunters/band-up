'use client';
import { clsx, type ClassValue } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { deserialize, fetchWrapper } from '@/lib/api';
import { Tag } from '@/lib/api/dto/category';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function clearDecksFromLocalStorage() {
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('deck:')) keysToRemove.push(key);
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
}

export function initDeckAutoClear() {
    clearDecksFromLocalStorage();
    setInterval(clearDecksFromLocalStorage, 5 * 60 * 60 * 1000);
}

export function useDebounce<T>(value: T, delay = 1000) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
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
