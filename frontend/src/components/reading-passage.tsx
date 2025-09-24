import { ScrollArea } from '@/components/ui/scroll-area';

interface ReadingPassageProps {
    title: string;
    content: string;
}

export default function ReadingPassage({
    title,
    content,
}: ReadingPassageProps) {
    return (
        <div className="h-full">
            <div className="mb-4">
                <h2 className="mb-2 text-2xl font-bold text-balance">
                    {title}
                </h2>
            </div>

            <ScrollArea className="custom-scrollbar h-[calc(100%-60px)]">
                <div className="pr-4">
                    {content.split('\n\n').map((paragraph, index) => (
                        <p
                            key={index}
                            className="mb-4 text-lg leading-relaxed text-pretty"
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
