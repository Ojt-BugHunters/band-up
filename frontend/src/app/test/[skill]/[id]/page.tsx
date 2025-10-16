'use client';
import {
    BookText,
    CircleQuestionMark,
    Clock,
    FileText,
    Headphones,
    LayoutPanelTop,
    MessageCircle,
    Play,
    User,
} from 'lucide-react';
import {
    listeningTest,
    comments,
    readingTest,
    speakingTest,
    writingTest,
} from '../../../../../constants/sample-data';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Content } from '@tiptap/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';
import CommentSection from '@/components/comment-section';

interface PageProps {
    params: Promise<{
        skill: string;
        id: string;
    }>;
}

export const testInstructions: Record<string, string[]> = {
    listening: [
        'Complete all sections in the given order',
        'You will hear each recording only once',
        'Answer all questions as you listen',
        'You have 10 minutes at the end to transfer your answers',
        'Use only a pencil to mark your answers',
    ],
    reading: [
        'Answer all questions within the time limit',
        'Do not open the question booklet until instructed',
        'Write your answers on the answer sheet',
        'You may underline keywords in the passage',
    ],
    writing: [
        'You have 60 minutes for 2 tasks',
        'Spend about 20 minutes on Task 1 and 40 minutes on Task 2',
        'Write in full sentences; notes are not acceptable',
    ],
    speaking: [
        'The test is recorded',
        'Speak clearly and naturally',
        'There are 3 parts in the test',
    ],
};

const skillConfig = {
    listening: {
        icon: Headphones,
        test: listeningTest,
        instructions: testInstructions['listening'],
    },
    reading: {
        icon: BookText,
        test: readingTest,
        instructions: testInstructions['reading'],
    },
    speaking: {
        icon: MessageCircle,
        test: speakingTest,
        instructions: testInstructions['speaking'],
    },
    writing: {
        icon: CircleQuestionMark,
        test: writingTest,
        instructions: testInstructions['writing'],
    },
};

export default function TestOverview({ params }: PageProps) {
    const { skill } = React.use(params);
    const dataConfig = skillConfig[skill as keyof typeof skillConfig];
    const [value, setValue] = useState<Content>('');
    const [submitting, setSubmitting] = useState(false);

    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const handleSubmit = async () => {
        // mutation
        setValue(null);
        setSubmitting(true);
    };
    const handleSectionToggle = (sectionId: string) => {
        setSelectedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId],
        );
    };
    const test = dataConfig.test;
    const Icon = dataConfig.icon;
    const instructions = dataConfig.instructions;
    return (
        <TooltipProvider>
            <div className="flex-1 space-y-6 bg-white p-6 dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-balance text-transparent dark:from-white dark:to-slate-300">
                                    {test.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                    <StatsGrid>
                        <Stats>
                            <StatsIcon className="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <Clock />
                            </StatsIcon>
                            <StatsValue>{test.duration}</StatsValue>
                            <StatsLabel>minutes</StatsLabel>
                            <StatsDescription>Total test time</StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400">
                                <LayoutPanelTop />
                            </StatsIcon>
                            <StatsValue>{test.section.length}</StatsValue>
                            <StatsLabel>Sections</StatsLabel>
                            <StatsDescription>
                                Total test sections
                            </StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                                <CircleQuestionMark />
                            </StatsIcon>
                            <StatsValue>{test.number_questions}</StatsValue>
                            <StatsLabel>Questions</StatsLabel>
                            <StatsDescription>Total questions</StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400">
                                <User />
                            </StatsIcon>
                            <StatsValue>{test.number_participant}</StatsValue>
                            <StatsLabel>Participants</StatsLabel>
                            <StatsDescription>
                                Have taken this test
                            </StatsDescription>
                        </Stats>
                    </StatsGrid>

                    <Tabs defaultValue="sections" className="w-full">
                        <TabsList className="mb-8 grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-900">
                            <TabsTrigger
                                value="sections"
                                className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                            >
                                <FileText className="h-4 w-4" />
                                Doing part of test
                            </TabsTrigger>
                            <TabsTrigger
                                value="fulltest"
                                className="dark:data-[state=active]:bg-black dark:data-[state=active]:text-white"
                            >
                                <Play className="h-4 w-4" />
                                Doing full test
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="sections" className="space-y-6">
                            <Card className="border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl dark:border-slate-800 dark:from-black dark:to-slate-950 dark:hover:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-800 dark:text-white">
                                            {test.title}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto rounded-full bg-indigo-100 text-sm text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        >
                                            {test.duration} minutes
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">
                                        Choose specific sections to practice
                                        individually
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {test.section.map((section) => {
                                        const isChecked =
                                            selectedSections.includes(
                                                section.id,
                                            );
                                        return (
                                            <div
                                                key={section.id}
                                                onClick={() =>
                                                    handleSectionToggle(
                                                        section.id,
                                                    )
                                                }
                                                className={`flex cursor-pointer items-center space-x-4 rounded-xl border p-4 transition-all duration-300 ${
                                                    isChecked
                                                        ? 'border-indigo-300 bg-indigo-50 shadow-md dark:border-indigo-500/30 dark:bg-indigo-500/10'
                                                        : 'border-slate-200 bg-white hover:bg-indigo-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-indigo-500/5'
                                                }`}
                                            >
                                                <Checkbox
                                                    id={section.id}
                                                    checked={isChecked}
                                                    onCheckedChange={() =>
                                                        handleSectionToggle(
                                                            section.id,
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                    className="data-[state=checked]:bg-zinc-700 dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={section.id}
                                                        className="cursor-pointer font-medium text-slate-800 dark:text-white"
                                                    >
                                                        {section.title}
                                                    </label>
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        {section.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full bg-slate-100 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                        >
                                                            {section.questions}{' '}
                                                            questions
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                                <div className="pt-2">
                                    <Button
                                        asChild
                                        className="ml-6 bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl dark:from-white dark:to-slate-100 dark:text-black dark:hover:from-slate-100 dark:hover:to-slate-200"
                                        disabled={selectedSections.length === 0}
                                        size="lg"
                                    >
                                        <Link
                                            href={`/test/${skill}/${test.id}/do?mode=single&skill=${skill}&section=${selectedSections.join(',')}`}
                                        >
                                            Start Selected Sections (
                                            {selectedSections.length})
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="fulltest" className="space-y-6">
                            <Card className="border border-white/20 bg-white/70 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-black">
                                <CardHeader>
                                    <CardTitle className="dark:text-white">
                                        Complete {test.title}
                                    </CardTitle>
                                    <CardDescription className="dark:text-slate-400">
                                        Take the full test with all{' '}
                                        {test.number_sections} sections in the
                                        official order and timing.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        {test.section.map((section, index) => (
                                            <div
                                                key={section.id}
                                                className="flex items-center gap-3 rounded-lg border border-white/30 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/70 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                            >
                                                <Badge
                                                    variant="default"
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold"
                                                >
                                                    {index + 1}
                                                </Badge>
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10">
                                                    <Headphones className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold dark:text-white">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm dark:text-slate-400">
                                                        {section.questions}{' '}
                                                        questions •{' '}
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 rounded-lg border border-white/30 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 backdrop-blur-sm dark:border-slate-800 dark:from-blue-950/20 dark:to-purple-950/20">
                                        <h3 className="font-semibold dark:text-white">
                                            Test Instructions
                                        </h3>
                                        <ul className="text-muted-foreground space-y-2 text-sm dark:text-slate-400">
                                            {instructions.map((ins, i) => (
                                                <li key={i}>• {ins}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Link
                                        href={`/test/${skill}/${test.id}/do?mode=full&skill=${skill}`}
                                    >
                                        <Button
                                            size="lg"
                                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 shadow-lg transition-all duration-300 hover:from-green-700 hover:to-blue-700 hover:shadow-xl dark:from-white dark:to-slate-100 dark:text-black dark:hover:from-slate-100 dark:hover:to-slate-200"
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Full Test ({
                                                test.duration
                                            }{' '}
                                            minutes)
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <CommentSection
                        comments={comments}
                        value={value}
                        onChange={setValue}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        postButtonText="Post comment"
                    />
                </div>
            </div>
        </TooltipProvider>
    );
}
