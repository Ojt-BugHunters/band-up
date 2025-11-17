'use client';
import DeckForm from './deck-form';

export default function CreateDeckPage() {
    return (
        <div className="mx-auto mt-14 p-8">
            <DeckForm mode="create" />
        </div>
    );
}
