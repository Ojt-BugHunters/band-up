'use client';
import { clsx, type ClassValue } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

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

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const formatDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    return `${minutes} min`;
};
