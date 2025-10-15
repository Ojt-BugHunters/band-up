'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { featureBlogs } from '../../constants/sample-data';
import Image from 'next/image';
import Link from 'next/link';

export function FeaturedCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const total = featureBlogs.length;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % total);
        }, 4000);
        return () => clearInterval(timer);
    }, [total]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % total);
    const prevSlide = () =>
        setCurrentSlide((prev) => (prev - 1 + total) % total);

    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-xl">
            {featureBlogs.map((post, index) => (
                <Link href={`/blog/${post.id}`} key={post.id}>
                    <div
                        key={post.id}
                        className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
                            index === currentSlide
                                ? 'translate-x-0'
                                : index < currentSlide
                                  ? '-translate-x-full'
                                  : 'translate-x-full'
                        }`}
                    >
                        <Card className="relative h-full w-full overflow-hidden border-0 shadow-2xl">
                            <Image
                                src={post.image || '/placeholder.svg'}
                                alt={post.title}
                                fill
                                sizes="100vw"
                                priority={index === currentSlide}
                                quality={90}
                                className="absolute inset-0 object-cover"
                            />

                            <div className="absolute inset-0 bg-black/60" />

                            <div className="relative z-20 flex h-full flex-col justify-end p-8">
                                <div className="mb-4">
                                    <div className="mb-4 flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="bg-primary text-primary-foreground inline-block rounded-full px-3 py-1 text-sm font-medium"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>{' '}
                                    <h2 className="mb-4 text-4xl leading-tight font-bold text-balance text-white drop-shadow-lg">
                                        {post.title}
                                    </h2>
                                    <p className="mb-4 max-w-2xl text-lg text-pretty text-white/95 drop-shadow-md">
                                        {post.subContent}
                                    </p>
                                    <div className="flex items-center gap-6 text-sm text-white/90 drop-shadow-md">
                                        <span className="inline-flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            {post.numberOfReader.toLocaleString(
                                                'en-US',
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Link>
            ))}

            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-4 z-30 -translate-y-1/2 transform border-0 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
                onClick={prevSlide}
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-4 z-30 -translate-y-1/2 transform border-0 bg-black/30 text-white backdrop-blur-sm hover:bg-black/50"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 transform space-x-2">
                {featureBlogs.map((_, index) => (
                    <button
                        key={index}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-3 w-3 rounded-full transition-all ${
                            index === currentSlide ? 'bg-white' : 'bg-white/50'
                        }`}
                        onClick={() => setCurrentSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}
