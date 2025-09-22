import {
    BookOpen,
    Clock,
    FileText,
    Headphones,
    Play,
    User,
} from 'lucide-react';
import { testData } from '../../../../constants/sample-data';
import { Card } from '@/components/ui/card';
import {
    Stats,
    StatsDescription,
    StatsGrid,
    StatsIcon,
    StatsLabel,
    StatsValue,
} from '@/components/stats';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestOverview() {
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

                <Tabs defaultValue="account" className="w-full">
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
                </Tabs>
            </div>
        </div>
    );
}
