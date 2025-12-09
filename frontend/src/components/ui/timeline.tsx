'use client';
import { useScroll, useTransform, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export const Timeline = () => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setHeight(rect.height);
        }
    }, [ref]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 10%', 'end 50%'],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div
            className="w-full bg-white font-sans md:px-10 dark:bg-neutral-950"
            ref={containerRef}
        >
            <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
                <div
                    style={{ height: height + 'px' }}
                    className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
                >
                    <motion.div
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                        className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-purple-500 via-blue-500 to-transparent blur-sm"
                    />
                </div>

                {informationData.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-start pt-10 md:gap-10 md:pt-40"
                    >
                        <div className="sticky top-40 z-10 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
                            <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm md:left-3 dark:border-neutral-800 dark:bg-black">
                                <div className="h-4 w-4 rounded-full border border-neutral-300 bg-neutral-200 p-2 dark:border-neutral-700 dark:bg-neutral-800" />
                            </div>

                            <div className="hidden md:block md:pl-20">
                                <h3 className="text-xl font-bold text-neutral-500 md:text-5xl dark:text-neutral-500">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-sm font-medium tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
                                    {item.subTitle}
                                </p>
                            </div>
                        </div>

                        <div className="relative w-full pr-4 pl-20 md:pl-4">
                            <div className="mb-4 md:hidden">
                                <h3 className="text-2xl font-bold text-neutral-500 dark:text-neutral-500">
                                    {item.title}
                                </h3>
                                <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase">
                                    {item.subTitle}
                                </p>
                            </div>

                            <p className="mb-8 text-base leading-relaxed font-normal text-neutral-600 dark:text-neutral-300">
                                {item.description}
                            </p>

                            <div className="group relative">
                                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur transition duration-1000 group-hover:opacity-40 group-hover:duration-200"></div>

                                <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                                    <Image
                                        src={item.imageSrc}
                                        alt={item.title}
                                        fill
                                        quality={100}
                                        className="transform object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const informationData = [
    {
        title: 'Test',
        subTitle: 'Real-time Assessment',
        description:
            'Do our latest IELTS Trial Test in our system to prepare the best before taking an exam. Experience the pressure and format of the real test.',
        imageSrc: '/web-intro-test.jpg',
    },
    {
        title: 'Room',
        subTitle: 'Collaborative Space',
        description:
            'Cooperate with your friends and your mentor directly and convenient in our room system. Share screens, chat, and learn together.',
        imageSrc: '/web-intro-room.png',
    },
    {
        title: 'Blog',
        subTitle: 'Knowledge Hub',
        description:
            'The blog system to update the latest knowledge, tips, and strategies related to IELTS Test from high achievers.',
        imageSrc: '/web-intro-blog.png',
    },
    {
        title: 'Flashcard',
        subTitle: 'Smart Memory',
        description:
            'A flashcard feature which help learner to study vocabulary quickly and efficiently using Spaced Repetition System (SRS).',
        imageSrc: '/web-intro-flashcard.jpg',
    },
];
