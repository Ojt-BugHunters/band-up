'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText } from 'lucide-react';
import ProgressDialog from '@/components/progress-dialog';
import QuestionPanel from '@/components/question-panel';
import ReadingPassage from '@/components/reading-passage';

// Import the Question type for strong typing
import { Question } from './question-panel';

// Mock data for IELTS reading test
const mockPassages: {
    id: string;
    title: string;
    content: string;
    questions: Question[];
}[] = [
    {
        id: 'passage1',
        title: 'The History of Urban Planning',
        content: `Urban planning has evolved significantly over the centuries, transforming from simple village layouts to complex metropolitan designs. The earliest forms of urban planning can be traced back to ancient civilizations such as the Indus Valley, where cities like Harappa and Mohenjo-daro demonstrated sophisticated drainage systems and grid-like street patterns.

During the Industrial Revolution, rapid urbanization created numerous challenges. Cities became overcrowded, leading to poor living conditions and health problems. This period marked the beginning of modern urban planning as a professional discipline. Visionaries like Baron Haussmann in Paris and Daniel Burnham in Chicago pioneered comprehensive city planning approaches.

The 20th century brought new theories and methodologies to urban planning. The Garden City movement, initiated by Ebenezer Howard, proposed self-contained communities surrounded by greenbelts. This concept influenced suburban development worldwide and established the importance of balancing urban growth with environmental considerations.

Contemporary urban planning faces unique challenges including climate change, technological advancement, and demographic shifts. Smart city initiatives now integrate digital technologies to improve infrastructure efficiency and quality of life. Sustainable development principles guide modern planners in creating environmentally responsible urban environments.

The future of urban planning lies in adaptive strategies that can respond to changing social, economic, and environmental conditions. Planners must consider factors such as population growth, resource scarcity, and the need for resilient infrastructure that can withstand natural disasters and other disruptions.`,
        questions: [
            {
                id: 1,
                type: 'multiple-choice',
                question:
                    'According to the passage, the earliest forms of urban planning can be traced back to:',
                options: [
                    'Ancient Greece',
                    'The Roman Empire',
                    'The Indus Valley',
                    'Medieval Europe',
                ],
                answer: '',
            },
            {
                id: 2,
                type: 'short-answer',
                question:
                    'Name two cities mentioned as examples of early urban planning.',
                answer: '',
            },
            {
                id: 3,
                type: 'true-false',
                question:
                    'The Garden City movement was initiated during the Industrial Revolution.',
                answer: '',
            },
            {
                id: 4,
                type: 'completion',
                question:
                    'Modern urban planning must consider _______ change, technological advancement, and demographic shifts.',
                answer: '',
            },
            {
                id: 5,
                type: 'multiple-choice',
                question:
                    'What does the passage suggest about future urban planning?',
                options: [
                    'It should focus only on technology',
                    'It must be adaptive to changing conditions',
                    'It should ignore environmental factors',
                    'It requires no professional training',
                ],
                answer: '',
            },
        ],
    },
    {
        id: 'passage2',
        title: 'Marine Biodiversity and Conservation',
        content: `The world's oceans harbor an extraordinary diversity of life forms, from microscopic plankton to massive whales. Marine biodiversity encompasses all living organisms in saltwater environments, including coastal areas, open oceans, and deep-sea habitats. This biological richness is essential for maintaining healthy ocean ecosystems and supporting human livelihoods.

Coral reefs represent one of the most biodiverse marine ecosystems on Earth. Often called the "rainforests of the sea," these structures support approximately 25% of all marine species despite covering less than 1% of the ocean floor. The Great Barrier Reef alone hosts over 1,500 species of fish and 400 types of coral.

However, marine biodiversity faces unprecedented threats from human activities. Overfishing has depleted fish populations worldwide, with some species experiencing population declines of over 90%. Pollution, particularly plastic waste and chemical runoff, contaminates marine habitats and affects food chains. Climate change causes ocean acidification and rising temperatures, leading to coral bleaching events.

Conservation efforts are crucial for protecting marine biodiversity. Marine protected areas (MPAs) serve as sanctuaries where marine life can recover and thrive. International agreements like the Convention on Biological Diversity establish frameworks for conservation action. Additionally, sustainable fishing practices and pollution reduction measures help preserve marine ecosystems.

Recent technological advances offer new opportunities for marine conservation. Satellite monitoring systems track illegal fishing activities, while underwater drones survey remote ocean areas. Genetic techniques help scientists understand species relationships and identify conservation priorities. These tools enable more effective protection strategies for marine biodiversity.`,
        questions: [
            {
                id: 6,
                type: 'completion',
                question:
                    'Coral reefs are often called the "_______ of the sea."',
                answer: '',
            },
            {
                id: 7,
                type: 'multiple-choice',
                question:
                    'What percentage of marine species do coral reefs support?',
                options: ['10%', '15%', '25%', '50%'],
                answer: '',
            },
            {
                id: 8,
                type: 'short-answer',
                question:
                    'List three threats to marine biodiversity mentioned in the passage.',
                answer: '',
            },
            {
                id: 9,
                type: 'true-false',
                question:
                    'Marine protected areas serve as sanctuaries for marine life recovery.',
                answer: '',
            },
            {
                id: 10,
                type: 'multiple-choice',
                question:
                    'Which technology is mentioned for tracking illegal fishing?',
                options: [
                    'Underwater drones',
                    'Genetic techniques',
                    'Satellite monitoring',
                    'Sonar systems',
                ],
                answer: '',
            },
        ],
    },
    {
        id: 'passage3',
        title: 'Artificial Intelligence in Healthcare',
        content: `Artificial Intelligence (AI) is revolutionizing healthcare by enhancing diagnostic accuracy, streamlining treatment processes, and improving patient outcomes. Machine learning algorithms can analyze vast amounts of medical data to identify patterns that might escape human observation, leading to earlier disease detection and more personalized treatment approaches.

Medical imaging represents one of the most successful applications of AI in healthcare. Deep learning models can interpret X-rays, MRIs, and CT scans with remarkable precision, sometimes surpassing human radiologists in detecting certain conditions. For instance, AI systems have demonstrated superior performance in identifying diabetic retinopathy from retinal photographs and detecting skin cancer from dermatological images.

Drug discovery and development benefit significantly from AI technologies. Traditional pharmaceutical research can take decades and cost billions of dollars. AI accelerates this process by predicting molecular behavior, identifying potential drug compounds, and optimizing clinical trial designs. Companies like DeepMind have used AI to predict protein structures, advancing our understanding of biological processes.

Electronic health records (EHRs) generate enormous amounts of patient data that AI can analyze to improve care quality. Natural language processing techniques extract meaningful information from clinical notes, while predictive models identify patients at risk of complications. This enables healthcare providers to intervene proactively and prevent adverse outcomes.

Despite these advances, AI implementation in healthcare faces several challenges. Data privacy concerns, regulatory requirements, and the need for clinical validation slow adoption. Additionally, ensuring AI systems are unbiased and transparent remains crucial for maintaining trust between healthcare providers and patients. The future success of AI in healthcare depends on addressing these challenges while continuing to innovate.`,
        questions: [
            {
                id: 11,
                type: 'multiple-choice',
                question:
                    'According to the passage, AI in medical imaging can:',
                options: [
                    'Replace all radiologists',
                    'Sometimes surpass human radiologists',
                    'Only work with X-rays',
                    'Reduce imaging costs',
                ],
                answer: '',
            },
            {
                id: 12,
                type: 'completion',
                question:
                    'Traditional pharmaceutical research can take _______ and cost billions of dollars.',
                answer: '',
            },
            {
                id: 13,
                type: 'short-answer',
                question:
                    'Name two specific medical conditions mentioned where AI shows superior performance.',
                answer: '',
            },
            {
                id: 14,
                type: 'true-false',
                question:
                    'Natural language processing can extract information from clinical notes.',
                answer: '',
            },
            {
                id: 15,
                type: 'multiple-choice',
                question:
                    'What is mentioned as a challenge for AI implementation in healthcare?',
                options: [
                    'Lack of data',
                    'High costs only',
                    'Data privacy concerns',
                    'Limited technology',
                ],
                answer: '',
            },
        ],
    },
];

export function ReadingTest() {
    const [currentPassage, setCurrentPassage] = useState('passage1');
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
    const [isTestStarted, setIsTestStarted] = useState(false);

    // Timer effect
    useEffect(() => {
        if (!isTestStarted) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsTestStarted(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isTestStarted]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    };

    const getTotalQuestions = () => {
        return mockPassages.reduce(
            (total, passage) => total + passage.questions.length,
            0,
        );
    };

    const getAnsweredQuestions = () => {
        return Object.keys(answers).filter(
            (key) => answers[Number.parseInt(key)].trim() !== '',
        ).length;
    };

    const getUnansweredQuestions = () => {
        const allQuestions = mockPassages.flatMap(
            (passage) => passage.questions,
        );
        return allQuestions.filter(
            (q) => !answers[q.id] || answers[q.id].trim() === '',
        );
    };

    const currentPassageData = mockPassages.find(
        (p) => p.id === currentPassage,
    );

    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border bg-card border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FileText className="text-primary h-6 w-6" />
                                <h1 className="text-xl font-semibold text-balance">
                                    IELTS Reading Test
                                </h1>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                                Academic Module
                            </Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono text-lg">
                                    {formatTime(timeRemaining)}
                                </span>
                            </div>

                            <ProgressDialog
                                totalQuestions={getTotalQuestions()}
                                answeredQuestions={getAnsweredQuestions()}
                                unansweredQuestions={getUnansweredQuestions()}
                            />

                            {!isTestStarted ? (
                                <Button
                                    onClick={() => setIsTestStarted(true)}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    Start Test
                                </Button>
                            ) : (
                                <Button
                                    variant="destructive"
                                    onClick={() => setIsTestStarted(false)}
                                >
                                    End Test
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Reading Passage */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-balance">
                                        Reading Passages
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {mockPassages.findIndex(
                                            (p) => p.id === currentPassage,
                                        ) + 1}{' '}
                                        of {mockPassages.length}
                                    </Badge>
                                </div>

                                <Tabs
                                    value={currentPassage}
                                    onValueChange={setCurrentPassage}
                                    className="w-full"
                                >
                                    <TabsList className="bg-muted grid w-full grid-cols-3">
                                        {mockPassages.map((passage, index) => (
                                            <TabsTrigger
                                                key={passage.id}
                                                value={passage.id}
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm"
                                            >
                                                Passage {index + 1}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </CardHeader>

                            <CardContent className="h-[calc(100%-120px)]">
                                {currentPassageData && (
                                    <ReadingPassage
                                        title={currentPassageData.title}
                                        content={currentPassageData.content}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Questions Panel */}
                    <div className="lg:col-span-1">
                        {currentPassageData && (
                            <QuestionPanel
                                questions={currentPassageData.questions}
                                answers={answers}
                                onAnswerChange={handleAnswerChange}
                                passageTitle={currentPassageData.title}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
