import {
    Hero,
    HeroDescription,
    HeroKeyword,
    HeroSummary,
    HeroTitle,
} from '@/components/hero';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import {
    Award,
    BookOpen,
    Calendar,
    ChevronDown,
    Headphones,
    History,
    Mic,
    PenTool,
    Target,
    TrendingUp,
} from 'lucide-react';
import { testHistory } from '../../../constants/sample-data';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export default function TestHistory() {
    return (
        <div className="flex-1 space-y-6 p-6">
            <Hero>
                <HeroSummary color="yellow">
                    <History className="mr-2 h-4 w-4" />
                    Review Test
                </HeroSummary>
                <HeroTitle>
                    Tracked Test
                    <HeroKeyword color="green">Done</HeroKeyword>
                </HeroTitle>
                <HeroDescription>
                    Manage the test that you have done to see your brilliant
                    progress
                </HeroDescription>
            </Hero>

            <StatsGrid>
                <Stats>
                    <StatsIcon className="bg-indigo-50 text-indigo-600">
                        <Award />
                    </StatsIcon>
                    <StatsValue>7.0</StatsValue>
                    <StatsLabel>Average Score</StatsLabel>
                    <StatsDescription>Score between test</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-green-50 text-green-600">
                        <Target />
                    </StatsIcon>
                    <StatsValue>9.0</StatsValue>
                    <StatsLabel>Highest Score</StatsLabel>
                    <StatsDescription>
                        Highest Score of all test
                    </StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-rose-50 text-rose-600">
                        <Calendar />
                    </StatsIcon>
                    <StatsValue>3</StatsValue>
                    <StatsLabel>Tests</StatsLabel>
                    <StatsDescription>Total test taken</StatsDescription>
                </Stats>
                <Stats>
                    <StatsIcon className="bg-yellow-50 text-yellow-600">
                        <TrendingUp />
                    </StatsIcon>
                    <StatsValue>+0.5</StatsValue>
                    <StatsLabel>Improvement</StatsLabel>
                    <StatsDescription>
                        Your own improvement so far
                    </StatsDescription>
                </Stats>
            </StatsGrid>
            <div className="mx-auto max-w-7xl">
                <Accordion type="single" collapsible className="space-y-4">
                    {testHistory.map((test, index) => (
                        <AccordionItem
                            key={test.id}
                            value={`test-${test.id}`}
                            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            <AccordionTrigger className="px-6 py-5 transition-colors hover:bg-zinc-50 hover:no-underline [&[data-state=open]>div]:bg-zinc-50">
                                <div className="flex w-full items-center justify-between pr-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-left">
                                            <div className="mb-1 text-base font-semibold text-zinc-900">
                                                {new Date(
                                                    test.date,
                                                ).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-zinc-500">
                                                    Overall Score
                                                </span>
                                                {index === 0 && (
                                                    <Badge className="rounded-full bg-zinc-900 px-2 py-0 text-xs text-white">
                                                        Latest
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold text-zinc-900">
                                            {test.overallScore}
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-zinc-500 transition-transform duration-300" />
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pt-2 pb-6">
                                <div className="mt-2 grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div className="cursor-pointer space-y-2 rounded-2xl border border-blue-100/50 bg-blue-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50 hover:shadow-lg">
                                        <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                                            <Headphones className="h-3.5 w-3.5" />
                                            Listening
                                        </div>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {test.listening}
                                        </div>
                                    </div>

                                    <div className="cursor-pointer space-y-2 rounded-2xl border border-green-100/50 bg-green-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-green-50 hover:shadow-lg">
                                        <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            Reading
                                        </div>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {test.reading}
                                        </div>
                                    </div>

                                    <div className="cursor-pointer space-y-2 rounded-2xl border border-purple-100/50 bg-purple-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-purple-50 hover:shadow-lg">
                                        <div className="flex items-center gap-2 text-xs font-medium text-purple-600">
                                            <PenTool className="h-3.5 w-3.5" />
                                            Writing
                                        </div>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {test.writing}
                                        </div>
                                    </div>

                                    <div className="cursor-pointer space-y-2 rounded-2xl border border-pink-100/50 bg-pink-50/50 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-pink-50 hover:shadow-lg">
                                        <div className="flex items-center gap-2 text-xs font-medium text-pink-600">
                                            <Mic className="h-3.5 w-3.5" />
                                            Speaking
                                        </div>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {test.speaking}
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
