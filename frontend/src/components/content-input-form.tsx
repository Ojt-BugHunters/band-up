// Form to input content in create test progress
import { TestCreationData, TestType } from '@/lib/api/dto/create-test';
import { ReadingContentForm } from './reading-content-form';

interface ContentInputFormProps {
    testType: TestType;
    data: TestCreationData;
    onDataUpdate: (data: Partial<TestCreationData>) => void;
}

export function ContentInputForms({
    testType,
    data,
    onDataUpdate,
}: ContentInputFormProps) {
    switch (testType) {
        case 'reading':
            return (
                <ReadingContentForm
                    passages={data.readingPassages || []}
                    onPassagesUpdate={(passages) =>
                        onDataUpdate({ readingPassages: passages })
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
            return null;
    }
}
