'use client';
import {
    FormState,
    FormStep,
    TestCreationData,
    TestType,
} from '@/lib/api/dto/create-test';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCreateTest } from '@/hooks/ use-create-test';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Badge, BookOpen, Check } from 'lucide-react';
import { TestTypeSelection } from '@/components/test-type-selection';
import { ContentInputForms } from '@/components/content-input-form';
import { QuestionInputForms } from '@/components/question-input-form';

export default function CreateTestPage() {
    const { form } = useCreateTest();
    const router = useRouter();
    const [formState, setFormState] = useState<FormState>({
        currentStep: 1,
        testType: null,
        data: {} as TestCreationData,
    });

    const handleStepChange = (step: FormStep) => {
        setFormState((prev) => ({ ...prev, currentStep: step }));
    };

    const handleTestTypeSelect = (testType: TestType) => {
        setFormState((prev) => ({
            ...prev,
            testType,
            data: { ...prev.data, testType },
        }));
        form.setValue('testType', testType);
    };

    const handleDataUpdate = (data: Partial<TestCreationData>) => {
        setFormState((prev) => ({
            ...prev,
            data: { ...prev.data, ...data },
        }));
    };

    return (
        <div className="flex-1 space-y-6 p-6">
            <header className="relative left-30 mt-15">
                <div className="container mx-auto px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/test')}
                                className="hover:bg-muted/50 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300"
                            >
                                <BookOpen className="h-5 w-5" />
                                <span className="text-base font-medium">
                                    Back to test
                                </span>
                            </Button>
                        </div>
                        <div className="flex items-center gap-6">
                            {formState.testType && (
                                <Badge className="bg-muted/50 text-foreground border-border/50 rounded-xl px-4 py-2 text-base font-semibold">
                                    {formState.testType
                                        .charAt(0)
                                        .toUpperCase() +
                                        formState.testType.slice(1)}{' '}
                                    Test
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex flex-col items-center space-y-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                            formState.currentStep >= 1
                                                ? 'bg-foreground text-background shadow-lg'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        1
                                    </div>
                                    <div className="text-center">
                                        <p className="text-foreground text-xs font-medium">
                                            Test Type
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-border relative mx-6 h-0.5 flex-1">
                                    <div
                                        className="bg-foreground absolute top-0 left-0 h-full transition-all duration-500"
                                        style={{
                                            width:
                                                formState.currentStep >= 2
                                                    ? '100%'
                                                    : '0%',
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                            formState.currentStep >= 2
                                                ? 'bg-foreground text-background shadow-lg'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <div className="text-center">
                                        <p className="text-foreground text-xs font-medium">
                                            Content
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-border relative mx-6 h-0.5 flex-1">
                                    <div
                                        className="bg-foreground absolute top-0 left-0 h-full transition-all duration-500"
                                        style={{
                                            width:
                                                formState.currentStep >= 3
                                                    ? '100%'
                                                    : '0%',
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col items-center space-y-2">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                                            formState.currentStep >= 3
                                                ? 'bg-foreground text-background shadow-lg'
                                                : 'bg-muted text-muted-foreground'
                                        }`}
                                    >
                                        3
                                    </div>
                                    <div className="text-center">
                                        <p className="text-foreground text-xs font-medium">
                                            Questions
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="animate-in fade-in slide-in-from-bottom-8 mb-12 duration-600">
                        {formState.currentStep === 1 && (
                            <TestTypeSelection
                                selectedType={formState.testType}
                                onTypeSelect={handleTestTypeSelect}
                            />
                        )}

                        {formState.currentStep === 2 && formState.testType && (
                            <ContentInputForms
                                testType={formState.testType}
                                data={formState.data}
                                onDataUpdate={handleDataUpdate}
                            />
                        )}

                        {formState.currentStep === 3 && formState.testType && (
                            <QuestionInputForms
                                testType={formState.testType}
                                data={formState.data}
                                onDataUpdate={handleDataUpdate}
                            />
                        )}
                    </div>
                    <div className="flex items-center justify-between py-6">
                        <div>
                            {formState.currentStep > 1 && (
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        handleStepChange(
                                            (formState.currentStep -
                                                1) as FormStep,
                                        )
                                    }
                                    className="group hover:bg-muted flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium transition-all"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                    Previous
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            {formState.currentStep < 3 ? (
                                <Button
                                    onClick={() =>
                                        handleStepChange(
                                            (formState.currentStep +
                                                1) as FormStep,
                                        )
                                    }
                                    className="group bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    onClick={() => {
                                        console.log('Test Creation Data:', {
                                            ...formState.data,
                                        });
                                    }}
                                    className="bg-foreground text-background hover:bg-foreground/90 flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
                                >
                                    <Check className="h-5 w-5" />
                                    Create Test
                                </Button>
                            )}
                        </div>
                    </div>{' '}
                </div>
            </div>
        </div>
    );
}
