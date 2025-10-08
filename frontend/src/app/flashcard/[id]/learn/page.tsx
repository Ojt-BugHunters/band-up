import { DeckCard } from '@/lib/api/dto/flashcard';
import { useParams } from 'next/navigation';

export default function FlashCardTestPage() {
    const { id } = useParams<{ id: string }>();
    const raw = localStorage.getItem(`deck:${id}`);
    const deckCard: DeckCard = raw ? JSON.parse(raw) : null;

    console.log(deckCard);
    return (
        <div>
            <h1>hello</h1>
        </div>
    );
}
