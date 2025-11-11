'use client';

import { useEffect, useState } from 'react';

export function clearDecksFromLocalStorage() {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('deck:')) {
            keysToRemove.push(key);
        }
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
