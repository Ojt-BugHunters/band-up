'use client';
import { useParams } from 'next/navigation';
import EditDeckForm from '@/components/update-deck-form';

export default function EditDeckPage() {
    const { id } = useParams() as { id?: string };

    if (!id) {
        return <div className="p-8">Invalid Deck ID</div>;
    }

    return (
        <div className="mx-auto mt-14 p-8">
            <EditDeckForm deckId={id} />
        </div>
    );
}
