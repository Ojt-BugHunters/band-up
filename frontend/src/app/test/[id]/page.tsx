'use client';
import {
    CircleQuestionMark,
    Clock,
    FileText,
    Headphones,
    LayoutPanelTop,
    Play,
    User,
} from 'lucide-react';
import { testData } from '../../../../constants/sample-data';
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
import { testInstructions } from '../../../../constants/instruction';

export default function TestOverview() {
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const handleSectionToggle = (sectionId: string) => {
        setSelectedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId],
        );
    };
    const instructions = testInstructions['listening'];
    return (
        <div className="flex-1 space-y-6 p-6">
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                            <Headphones className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-balance text-transparent">
                                {testData.title}
                            </h1>
                        </div>
                    </div>
                </div>
                <StatsGrid>
                    <Stats>
                        <StatsIcon className="bg-indigo-50 text-indigo-600">
                            <Clock />
                        </StatsIcon>
                        <StatsValue>30</StatsValue>
                        <StatsLabel>minutes</StatsLabel>
                        <StatsDescription>Total test time</StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-green-50 text-green-600">
                            <LayoutPanelTop />
                        </StatsIcon>
                        <StatsValue>4</StatsValue>
                        <StatsLabel>Sections</StatsLabel>
                        <StatsDescription>Total test sections</StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-rose-50 text-rose-600">
                            <CircleQuestionMark />
                        </StatsIcon>
                        <StatsValue>40</StatsValue>
                        <StatsLabel>Questions</StatsLabel>
                        <StatsDescription>Total questions</StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-yellow-50 text-yellow-600">
                            <User />
                        </StatsIcon>
                        <StatsValue>1234</StatsValue>
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
                                        <Headphones className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                        {testData.title}
                                    </span>
                                    <Badge
                                        variant="secondary"
                                        className="ml-auto rounded-full bg-indigo-100 text-sm text-indigo-700"
                                    >
                                        {testData.duration} minutes
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-slate-500">
                                    Choose specific sections to practice
                                    individually
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                {testData.section.map((section) => {
                                    const isChecked = selectedSections.includes(
                                        section.id,
                                    );
                                    return (
                                        <div
                                            key={section.id}
                                            onClick={() =>
                                                handleSectionToggle(section.id)
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
                                    className="ml-6 bg-gradient-to-r from-blue-600 to-indigo-500 shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
                                    disabled={selectedSections.length === 0}
                                    size="lg"
                                >
                                    Start Selected Sections (
                                    {selectedSections.length})
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>
                    <TabsContent value="fulltest" className="space-y-6">
                        <Card className="border border-white/20 bg-white/70 shadow-xl backdrop-blur-md">
                            <CardHeader>
                                <CardTitle>Complete {testData.title}</CardTitle>
                                <CardDescription>
                                    Take the full test with all{' '}
                                    {testData.number_sections} sections in the
                                    official order and timing.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    {testData.section.map((section, index) => (
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
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Full Test ({testData.duration}{' '}
                                    minutes)
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
