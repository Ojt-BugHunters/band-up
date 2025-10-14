'use client';

import DeckForm from '@/components/deck-form';
import type { CreateDeckFormValues } from '@/hooks/use-create-deck-card';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';

export default function UpdateDeckPage() {
    const { id } = useParams<{ id: string }>();
    const raw = localStorage.getItem(`deck:${id}`);
    const deck = raw
        ? (JSON.parse(raw) as {
              id: string;
              title: string;
              description: string;
              public: boolean;
              password?: string;
              cards: { front: string; back: string }[];
          })
        : null;

    const initialValues: Partial<CreateDeckFormValues> & { id?: string } =
        useMemo(
            () => ({
                id,
                title: deck?.title ?? '',
                description: deck?.description ?? '',
                public: deck?.public ?? true,
                password: deck?.password ?? '',
                cards: deck?.cards ?? [{ front: '', back: '' }],
            }),
            [deck, id],
        );

    return (
        <div className="mx-auto mt-14 p-8">
            <DeckForm
                mode="update"
                initialValues={initialValues}
                submitText="Save changes"
            />
        </div>
    );
}
