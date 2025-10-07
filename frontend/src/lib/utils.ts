import { clsx, type ClassValue } from 'clsx';
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
    setInterval(clearDecksFromLocalStorage, 15 * 60 * 1000);
}
