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
    ReplyIcon,
    Send,
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
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { testInstructions } from '../../../../../constants/instruction';
import { Separator } from '@/components/ui/separator';
import { Content } from '@tiptap/react';
import { MinimalTiptapEditor } from '@/components/ui/minimal-tiptap';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AccountPicture } from '@/components/ui/account-picture';
import Link from 'next/link';

interface PageProps {
    params: {
        skill: string;
        id: string;
    };
}

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
    const { skill } = params;
    const dataConfig = skillConfig[skill as keyof typeof skillConfig];
    const [value, setValue] = useState<Content>('');
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

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
            <div className="flex-1 space-y-6 p-6">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-balance text-transparent">
                                    {test.title}
                                </h1>
                            </div>
                        </div>
                    </div>
                    <StatsGrid>
                        <Stats>
                            <StatsIcon className="bg-indigo-50 text-indigo-600">
                                <Clock />
                            </StatsIcon>
                            <StatsValue>{test.duration}</StatsValue>
                            <StatsLabel>minutes</StatsLabel>
                            <StatsDescription>Total test time</StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-green-50 text-green-600">
                                <LayoutPanelTop />
                            </StatsIcon>
                            <StatsValue>{test.section.length}</StatsValue>
                            <StatsLabel>Sections</StatsLabel>
                            <StatsDescription>
                                Total test sections
                            </StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-rose-50 text-rose-600">
                                <CircleQuestionMark />
                            </StatsIcon>
                            <StatsValue>{test.number_questions}</StatsValue>
                            <StatsLabel>Questions</StatsLabel>
                            <StatsDescription>Total questions</StatsDescription>
                        </Stats>
                        <Stats>
                            <StatsIcon className="bg-yellow-50 text-yellow-600">
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
                        <TabsList className="mb-8 grid w-full grid-cols-2">
                            <TabsTrigger value="sections">
                                <FileText className="h-4 w-4" />
                                Doing part of test
                            </TabsTrigger>
                            <TabsTrigger value="fulltest">
                                <Play className="h-4 w-4" />
                                Doing full test
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="sections" className="space-y-6">
                            <Card className="border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-md">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="font-semibold text-slate-800">
                                            {test.title}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto rounded-full bg-indigo-100 text-sm text-indigo-700"
                                        >
                                            {test.duration} minutes
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-slate-500">
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
                                                        ? 'border-indigo-300 bg-indigo-50 shadow-md'
                                                        : 'border-slate-200 bg-white hover:bg-indigo-50 hover:shadow-md'
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
                                                    className="data-[state=checked]:bg-zinc-700"
                                                />
                                                <div className="flex-1">
                                                    <label
                                                        htmlFor={section.id}
                                                        className="cursor-pointer font-medium text-slate-800"
                                                    >
                                                        {section.title}
                                                    </label>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {section.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="rounded-full bg-slate-100 text-xs text-slate-600"
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
                                        className="ml-6 bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                                        disabled={selectedSections.length === 0}
                                        size="lg"
                                    >
                                        <Link
                                            href={`/do?mode=single&skill=${skill}&section=${selectedSections.join(',')}`}
                                        >
                                            Start Selected Sections (
                                            {selectedSections.length})
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="fulltest" className="space-y-6">
                            <Card className="border border-white/20 bg-white/70 shadow-xl backdrop-blur-md">
                                <CardHeader>
                                    <CardTitle>Complete {test.title}</CardTitle>
                                    <CardDescription>
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
                                                className="flex items-center gap-3 rounded-lg border border-white/30 bg-white/50 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                                            >
                                                <Badge
                                                    variant="default"
                                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold"
                                                >
                                                    {index + 1}
                                                </Badge>
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                                    <Headphones className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">
                                                        {section.title}
                                                    </h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        {section.questions}{' '}
                                                        questions •{' '}
                                                        {section.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 rounded-lg border border-white/30 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 backdrop-blur-sm">
                                        <h3 className="font-semibold">
                                            Test Instructions
                                        </h3>
                                        <ul className="text-muted-foreground space-y-2 text-sm">
                                            {instructions.map((ins, i) => (
                                                <li key={i}>• {ins}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 shadow-lg transition-all duration-300 hover:from-green-700 hover:to-blue-700 hover:shadow-xl"
                                    >
                                        <Link
                                            href={`/do?mode=full&skill=${skill}`}
                                        >
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Full Test ({
                                                test.duration
                                            }{' '}
                                            minutes)
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <Separator className="my-8" />

                    <section className="mb-8">
                        <h2 className="text-foreground mb-6 flex items-center space-x-2 text-xl font-semibold">
                            <MessageCircle className="h-6 w-6" />
                            <span>Comments ({comments.length})</span>
                        </h2>
                    </section>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 space-y-3">
                                <MinimalTiptapEditor
                                    value={value}
                                    onChange={setValue}
                                    className="h-full min-h-40 w-full"
                                    output="html"
                                    placeholder="What do you feel about the test..."
                                    autofocus={false}
                                    editable={true}
                                    editorContentClassName="p-5 min-h-40 cursor-text"
                                    editorClassName="focus:outline-hidden min-h-40"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        className="rounded-lg bg-zinc-800 hover:bg-zinc-900"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Post comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator className="my-8" />
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-md transition hover:shadow-lg"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="h-10 w-10">
                                        <AccountPicture
                                            name={comment.author_name}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <h4 className="flex items-center gap-2 font-semibold text-slate-900">
                                            {comment.author_name}
                                            <MessageCircle className="h-4 w-4 text-rose-500" />
                                        </h4>
                                        <p className="mt-1 leading-relaxed text-slate-700">
                                            {comment.content}
                                        </p>
                                        {comment.reply?.length > 0 && (
                                            <div className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/80 p-3">
                                                {comment.reply.map((reply) => (
                                                    <div
                                                        key={reply.id}
                                                        className="flex items-start gap-3"
                                                    >
                                                        <div className="h-9 w-9">
                                                            <AccountPicture
                                                                name={
                                                                    reply.author_name
                                                                }
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="flex items-center gap-2 font-medium text-zinc-700">
                                                                {
                                                                    reply.author_name
                                                                }
                                                                <ReplyIcon className="h-4 w-4 text-zinc-500" />
                                                            </h5>
                                                            <p className="mt-1 leading-relaxed text-zinc-900">
                                                                {reply.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
