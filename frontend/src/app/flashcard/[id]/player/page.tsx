// 'use client';

// import { use } from 'react';
// import FlashcardPlayer from '@/components/flashcard-player';
// import { useFlashcardDeckCards } from '@/hooks/use-get-flashcard';

// type FlashcardPlayerPageProps = {
//     params: Promise<{ id: string }>;
//     searchParams?: Promise<{ password?: string }>;
// };

// export default function FlashcardPlayerPage({
//     params,
//     searchParams,
// }: FlashcardPlayerPageProps) {
//     const { id } = use(params);
//     const resolvedSearchParams = searchParams ? use(searchParams) : undefined;
//     const password = resolvedSearchParams?.password;

//     const {
//         data: deckCards = [],
//         isLoading,
//         isError,
//         error,
//     } = useFlashcardDeckCards(id, password);

//     if (isLoading) {
//         return (
//             <div className="flex min-h-screen items-center justify-center">
//                 Loading flashcards...
//             </div>
//         );
//     }

//     if (isError) {
//         const errorMessage =
//             error instanceof Error
//                 ? error.message
//                 : 'Unable to load flashcards.';
//         return (
//             <div className="flex min-h-screen items-center justify-center text-center">
//                 <div>
//                     <p className="text-lg font-semibold text-red-500">
//                         {errorMessage}
//                     </p>
//                     <p className="text-muted-foreground mt-2 text-sm">
//                         Please check the password and try again.
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     if (deckCards.length === 0) {
//         return (
//             <div className="flex min-h-screen items-center justify-center text-center">
//                 <p className="text-muted-foreground">
//                     No flashcards found in this deck yet.
//                 </p>
//             </div>
//         );
//     }

//     return (
//         <div className="flex min-h-screen items-center justify-center bg-gray-50 p-8 dark:bg-[#0a092d]">
//             <div className="w-full max-w-5xl">
//                 <FlashcardPlayer cards={deckCards} />
//             </div>
//         </div>
//     );
// }
