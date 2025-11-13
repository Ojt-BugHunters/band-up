'use client';

import { Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { Dictation } from '@/lib/api/dto/dictation';
import Image from 'next/image';

interface DictationCardProps {
    dictation: Dictation;
}

export default function DictationCard({ dictation }: DictationCardProps) {
    const difficultyImages = {
        easy: '/zenitsu-easy.jpg',
        medium: '/giyuu-medium.jpg',
        hard: '/muzan-hard.jpg',
    };

    const difficulty = dictation.difficult.toLowerCase() as
        | 'easy'
        | 'medium'
        | 'hard';

    const bgImage = difficultyImages[difficulty] || difficultyImages.medium;

    return (
        <Link
            href={`/dictation/${dictation.id}`}
            className="group relative block overflow-hidden rounded-xl border border-gray-200 bg-gray-900/5 shadow-lg transition-all duration-300 hover:shadow-xl"
        >
            <div className="relative aspect-video overflow-hidden rounded-t-xl">
                <Image
                    width={500}
                    height={500}
                    src={bgImage}
                    alt={dictation.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 flex flex-col justify-between p-3">
                    <div className="flex justify-between">
                        <span className="rounded-md bg-sky-600/90 px-2.5 py-1 text-xs font-semibold text-white shadow-md backdrop-blur">
                            🎧 {dictation.numberOfPeople ?? 'Audio'}
                        </span>
                        <span className="rounded-md bg-violet-200/90 px-2.5 py-1 text-xs font-semibold text-violet-800 shadow-sm backdrop-blur">
                            {dictation.difficult.toUpperCase()}
                        </span>
                    </div>

                    <div className="flex items-end justify-between">
                        <span className="rounded-md bg-sky-500/90 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
                            <Clock className="mr-1 inline h-3.5 w-3.5" />
                            {Math.floor(dictation.durationSeconds / 60)
                                .toString()
                                .padStart(2, '0')}
                            :
                            {(dictation.durationSeconds % 60)
                                .toString()
                                .padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 bg-white p-4 dark:bg-zinc-900">
                <h3 className="line-clamp-2 font-semibold text-gray-800 transition-colors group-hover:text-sky-600 dark:text-gray-100">
                    {dictation.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {dictation.numberOfPeople ?? 0} users
                    </span>
                    <div className="flex gap-2">
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] text-sky-700">
                            Dictation ✖
                        </span>
                        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] text-cyan-700">
                            Shadowing ✖
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
