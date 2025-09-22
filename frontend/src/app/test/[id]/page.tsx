'use client';

import {
    BookOpen,
    Clock,
    FileText,
    Headphones,
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

export default function TestOverview() {
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const handleSectionToggle = (sectionId: string) => {
        setSelectedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId],
        );
    };
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
                            <FileText />
                        </StatsIcon>
                        <StatsValue>150</StatsValue>
                        <StatsLabel>Total Tests</StatsLabel>
                        <StatsDescription>
                            Available practice tests
                        </StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-green-50 text-green-600">
                            <User />
                        </StatsIcon>
                        <StatsValue>92</StatsValue>
                        <StatsLabel>Total Participants</StatsLabel>
                        <StatsDescription>
                            Number of students practicing
                        </StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-rose-50 text-rose-600">
                            <Clock />
                        </StatsIcon>
                        <StatsValue>40</StatsValue>
                        <StatsLabel>mins Taken</StatsLabel>
                        <StatsDescription>
                            Avarage time taken for one test to complete
                        </StatsDescription>
                    </Stats>
                    <Stats>
                        <StatsIcon className="bg-yellow-50 text-yellow-600">
                            <BookOpen />
                        </StatsIcon>
                        <StatsValue>4</StatsValue>
                        <StatsLabel>Skills Coverd</StatsLabel>
                        <StatsDescription>
                            Reading, Listening, Speaking, Writing
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
                </Tabs>
            </div>
        </div>
    );
}
