import {
    CreateFullSectionFormValues,
    useCreatePassage,
} from '@/hooks/use-create-passage';
import {
    DictationQuestionFormData,
    useCreateQuestion,
} from '@/hooks/use-create-question';
import { useCreateTest, TestCreateFormValues } from '@/hooks/use-create-test';
import { useState } from 'react';
import { useFieldArray } from 'react-hook-form';

interface CreateDictationDialogProps {
    onSuccess?: () => void;
}

export function CreateDictationDialog({
    onSuccess,
}: CreateDictationDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [testId, setTestId] = useState<string>('');
    const [sectionIds, setSectionIds] = useState<string[]>([]);

    const { createTestForm } = useCreateTest();
    const { fullSectionForm, singleSectionForm } = useCreatePassage();
    const { dictationQuestionForm } = useCreateQuestion();

    const {
        fields: sectionFields,
        append: appendSection,
        remove: removeSection,
    } = useFieldArray({
        control: fullSectionForm.control,
        name: 'section',
    });

    const {
        fields: questionFields,
        append: appendQuestion,
        remove: removeQuestion,
    } = useFieldArray({
        control: dictationQuestionForm.control,
        name: 'questions',
    });

    const handleClose = () => {
        setOpen(false);
        setStep(1);
        setTestId('');
        setSectionIds([]);
        createTestForm.reset();
        fullSectionForm.reset();
        dictationQuestionForm.reset();
    };

    const onTestSubmit = (data: TestCreateFormValues) => {
        console.log(data);
    };

    const onSectionSubmit = (data: CreateFullSectionFormValues) => {
        console.log(data);
    };

    const onQuestionSubmit = (data: DictationQuestionFormData) => {
        console.log(data);
    };
}
