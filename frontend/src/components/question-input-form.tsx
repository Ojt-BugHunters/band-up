import { TestCreationData, TestType } from '@/lib/api/dto/create-test';
import { ReadingQuestionForm } from './reading-content-form';

interface QuestionInputFormsProps {
    testType: TestType;
    data: TestCreationData;
    onDataUpdate: (data: Partial<TestCreationData>) => void;
}

export function QuestionInputForms({
    testType,
    data,
    onDataUpdate,
}: QuestionInputFormsProps) {
    switch (testType) {
        case 'reading':
            return (
                <ReadingQuestionForm
                    passages={data.readingPassages || []}
                    questions={data.readingQuestions || []}
                    onQuestionsUpdate={(questions) =>
                        onDataUpdate({ readingQuestions: questions })
                    }
                />
            );
        case 'listening':
            return <div></div>;
        case 'writing':
            return <div></div>;
        case 'speaking':
            return <div></div>;
        default:
            return <div></div>;
    }
}
