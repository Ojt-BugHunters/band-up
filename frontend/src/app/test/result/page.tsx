import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResultsTab from './result-tab';
import CertificateTab from './certificate-tab';
import { BandScoreResponse, ScoredAnswer } from '@/lib/service/attempt/type';

interface ResultsPageProps {
    testData: BandScoreResponse;
}

export default function ResultsPage({ testData }: ResultsPageProps) {
    const correctAnswers = testData.responses.filter(
        (r: ScoredAnswer) => r.correct,
    ).length;
    const totalQuestions = testData.responses.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    return (
        <div className="from-background via-background to-accent/5 min-h-screen bg-gradient-to-br">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-sm font-semibold text-transparent">
                            BandUp IELTS
                        </span>
                    </div>
                    <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                        Your Test Results
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Congratulations on completing your IELTS test!
                    </p>
                </div>

                <Tabs defaultValue="results" className="mx-auto max-w-6xl">
                    <TabsList className="bg-muted mb-8 grid w-full grid-cols-2 rounded-full p-1">
                        <TabsTrigger
                            value="results"
                            className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Results & Analysis
                        </TabsTrigger>
                        <TabsTrigger
                            value="certificate"
                            className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                        >
                            Certificate
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="results" className="space-y-6">
                        <ResultsTab
                            testData={testData}
                            correctAnswers={correctAnswers}
                            totalQuestions={totalQuestions}
                            percentage={percentage}
                        />
                    </TabsContent>

                    <TabsContent value="certificate" className="space-y-6">
                        <CertificateTab
                            testData={testData}
                            bandScore={Math.round(percentage / 11.11)}
                            totalScore={testData.totalScore}
                            percentage={percentage}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
