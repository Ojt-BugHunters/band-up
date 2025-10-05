'use client';
import CreateDeckForm from '@/components/create-deck-form';

// fetch /quizlet/deck/create;
export default function CreateDeckPage() {
    return (
        <div className="mx-auto mt-14 p-8">
            <CreateDeckForm />
        </div>
    );
}
