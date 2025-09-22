export type FlashcardStyle = {
    badge: string;
    border: string;
    background: string;
    label: string;
    term: string;
};

const baseStyle: FlashcardStyle = {
    badge: 'bg-slate-200 text-slate-700',
    border: 'border-slate-200',
    background: 'bg-white',
    label: 'text-slate-400',
    term: 'text-slate-900',
};

const skillStyles: Record<string, FlashcardStyle> = {
    reading: {
        badge: 'bg-sky-100 text-sky-700',
        border: 'border-sky-200',
        background: 'bg-sky-50',
        label: 'text-sky-500',
        term: 'text-sky-700',
    },
    listening: {
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200',
        background: 'bg-emerald-50',
        label: 'text-emerald-500',
        term: 'text-emerald-700',
    },
    writing: {
        badge: 'bg-rose-100 text-rose-700',
        border: 'border-rose-200',
        background: 'bg-rose-50',
        label: 'text-rose-500',
        term: 'text-rose-700',
    },
    speaking: {
        badge: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200',
        background: 'bg-amber-50',
        label: 'text-amber-500',
        term: 'text-amber-700',
    },
    vocabulary: {
        badge: 'bg-indigo-100 text-indigo-700',
        border: 'border-indigo-200',
        background: 'bg-indigo-50',
        label: 'text-indigo-500',
        term: 'text-indigo-700',
    },
    grammar: {
        badge: 'bg-purple-100 text-purple-700',
        border: 'border-purple-200',
        background: 'bg-purple-50',
        label: 'text-purple-500',
        term: 'text-purple-700',
    },
};

export function getFlashcardStyle(skill?: string | null): FlashcardStyle {
    if (!skill) {
        return baseStyle;
    }
    const normalized = skill.trim().toLowerCase();
    return skillStyles[normalized] ?? baseStyle;
}
