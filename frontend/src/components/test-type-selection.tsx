import { TestType } from '@/lib/api/dto/create-test';
import { BookOpen, Headphones, Mic, PenTool } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { cn } from '@/lib/utils';

export const TEST_TYPES: {
    value: TestType;
    label: string;
    description: string;
}[] = [
    {
        value: 'reading',
        label: 'Reading',
        description:
            'Test reading comprehension with 3 passages and various question types',
    },
    {
        value: 'listening',
        label: 'Listening',
        description:
            'Test listening skills with 4 audio passages and comprehension questions',
    },
    {
        value: 'writing',
        label: 'Writing',
        description: 'Test writing abilities with Task 1 and Task 2 prompts',
    },
    {
        value: 'speaking',
        label: 'Speaking',
        description:
            'Test speaking skills across 3 parts with various question formats',
    },
];

const testTypeIcons = {
    reading: BookOpen,
    listening: Headphones,
    writing: PenTool,
    speaking: Mic,
};

const testTypeColors = {
    reading: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
    listening: 'border-green-200 bg-green-50 hover:bg-green-100',
    writing: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
    speaking: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
};

const testTypeIconColors = {
    reading: 'text-blue-600',
    listening: 'text-green-600',
    writing: 'text-purple-600',
    speaking: 'text-orange-600',
};

export function TestTypeSelection() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Choose Your Test Type
                </h3>
                <p className="text-muted-foreground">
                    Select the type of IELTS test you want to create. Each test
                    type has specific requirements and formats.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {TEST_TYPES.map((testType) => {
                    const Icon = testTypeIcons[testType.value];
                    return (
                        <Card
                            key={testType.value}
                            className={cn(
                                'cursor-pointer transition-all duration-200 hover:shadow-md',
                                testTypeColors[testType.value],
                            )}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                'rounded-lg bg-white p-2 shadow-sm',
                                                testTypeIconColors[
                                                    testType.value
                                                ],
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-foreground text-lg font-semibold">
                                                {testType.label}
                                            </CardTitle>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                                    {testType.description}
                                </CardDescription>

                                <div className="border-border/50 mt-4 border-t pt-3">
                                    <div className="text-muted-foreground text-xs">
                                        {testType.value === 'reading' &&
                                            '3 passages • Various question types'}
                                        {testType.value === 'listening' &&
                                            '4 audio sections • Comprehension questions'}
                                        {testType.value === 'writing' &&
                                            '2 tasks • Academic & Essay writing'}
                                        {testType.value === 'speaking' &&
                                            '3 parts • Interview & discussion'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
