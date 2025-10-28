import {
    CreateFullSectionFormInput,
    CreateFullSectionPayload,
    sectionFormSchema,
    useCreatePassage,
} from '@/hooks/use-create-passage';
import {
    DictationQuestionFormData,
    useCreateQuestion,
} from '@/hooks/use-create-question';
import { useCreateTest, TestCreateFormValues } from '@/hooks/use-create-test';
import { useState } from 'react';
import { SubmitHandler, useFieldArray } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus, Trash, Trash2 } from 'lucide-react';
import { Separator } from './ui/separator';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { useMutation } from '@tanstack/react-query';

interface CreateDictationDialogProps {
    onSuccess?: () => void;
}

export function CreateDictationDialog({
    onSuccess,
}: CreateDictationDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [testId, setTestId] = useState<string>(
        localStorage.getItem('create-test-id') ?? '',
    );
    const [sectionIds, setSectionIds] = useState<string[]>([]);

    const { createTestForm, mutation: createTestMutation } = useCreateTest();
    const { fullSectionForm, mutation: createSectionMutation } =
        useCreatePassage(testId);
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

    const createQuestionsMutation = useMutation({
        mutationFn: async (
            questions: DictationQuestionFormData['questions'],
        ) => {
            const promises = questions.map((question) => {
                const sectionId = sectionIds[question.sectionIndex - 1];
                return fetch(`/api/sections/${sectionId}/questions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        difficult: question.difficult,
                        type: question.type,
                        content: {
                            additionalProp1: question.audioUrl,
                            additionalProp2: question.script,
                            additionalProp3: '',
                        },
                    }),
                });
            });
            return Promise.all(promises);
        },
        onSuccess: () => {
            handleClose();
            onSuccess?.();
        },
        onError: () => {},
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
        createTestMutation.mutate(data);
        setStep(2);
    };

    const onSectionSubmit: SubmitHandler<CreateFullSectionFormInput> = (
        data,
    ) => {
        const payload: CreateFullSectionPayload = sectionFormSchema.parse(data);
        createSectionMutation.mutate(payload);
        setStep(3);
    };

    const onQuestionSubmit = (data: DictationQuestionFormData) => {
        console.log(data);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer rounded-xl bg-rose-500 font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-rose-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Dictation
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] w-[95vw] !max-w-none overflow-y-auto p-8 sm:!max-w-none sm:rounded-xl lg:!max-w-[1100px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        Create Dictation Test
                    </DialogTitle>
                    <DialogDescription>
                        Step {step} of 3:{' '}
                        {step === 1
                            ? 'Test Details'
                            : step === 2
                              ? 'Add Sections'
                              : 'Add Questions'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-center gap-2 py-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 w-16 rounded-full transition-colors ${
                                s === step
                                    ? 'bg-foreground'
                                    : s < step
                                      ? 'bg-muted-foreground'
                                      : 'bg-muted'
                            }`}
                        />
                    ))}
                </div>

                <Separator />

                {step === 1 && (
                    <Form {...createTestForm}>
                        <form
                            onSubmit={createTestForm.handleSubmit(onTestSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={createTestForm.control}
                                name="skillName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skill</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="bg-muted cursor-not-allowed"
                                                disabled
                                                value="Dictation"
                                            />
                                        </FormControl>

                                        <FormDescription>
                                            This field is fixed for dictation
                                            tests
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createTestForm.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Test Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Enter test title"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={createTestForm.control}
                                name="durationSeconds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Duration (seconds)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type="number"
                                                placeholder="Enter duration in seconds"
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createTestMutation.isPending}
                                >
                                    {createTestMutation.isPending
                                        ? 'Creating...'
                                        : 'Next'}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}

                {step === 2 && (
                    <Form {...fullSectionForm}>
                        <form
                            onSubmit={fullSectionForm.handleSubmit(
                                onSectionSubmit,
                            )}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                {sectionFields.map((field, index) => (
                                    <Card key={field.id} className="border-2">
                                        <CardContent className="pt-6">
                                            <div className="mb-4 flex items-start justify-between">
                                                <h3 className="text-lg font-semibold">
                                                    Section {index + 1}
                                                </h3>
                                                {sectionFields.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            removeSection(index)
                                                        }
                                                    >
                                                        <Trash className="text-destructive h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>

                                            <FormField
                                                control={
                                                    fullSectionForm.control
                                                }
                                                name={`section.${index}.title`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Section Title
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Enter section title"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* Nếu muốn hiển thị order index (read-only) chỉ để nhìn */}
                                            <div className="text-muted-foreground mt-2 text-xs">
                                                Order Index: {index + 1}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {sectionFields.length < 4 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full bg-transparent"
                                    onClick={() => appendSection({ title: '' })} // chỉ cần title
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Section ({sectionFields.length}/4)
                                </Button>
                            )}

                            <div className="flex justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Next
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                )}
                {step === 3 && (
                    <Form {...dictationQuestionForm}>
                        <form
                            onSubmit={dictationQuestionForm.handleSubmit(
                                onQuestionSubmit,
                            )}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                {questionFields.map((field, index) => {
                                    const sectionTitle =
                                        fullSectionForm.getValues(
                                            `section.${field.sectionIndex - 1}.title`,
                                        );
                                    return (
                                        <Card
                                            key={field.id}
                                            className="border-2"
                                        >
                                            <CardContent className="pt-6">
                                                <div className="mb-4 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold">
                                                            Question {index + 1}
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm">
                                                            Section{' '}
                                                            {field.sectionIndex}
                                                            : {sectionTitle}
                                                        </p>
                                                    </div>
                                                    {questionFields.length >
                                                        1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                removeQuestion(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="text-destructive h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField
                                                            control={
                                                                dictationQuestionForm.control
                                                            }
                                                            name={`questions.${index}.difficult`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Difficulty
                                                                    </FormLabel>
                                                                    <Select
                                                                        onValueChange={(
                                                                            value,
                                                                        ) =>
                                                                            field.onChange(
                                                                                Number(
                                                                                    value,
                                                                                ),
                                                                            )
                                                                        }
                                                                        defaultValue={field.value?.toString()}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger>
                                                                                <SelectValue placeholder="Select difficulty" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="1">
                                                                                1
                                                                                -
                                                                                Easy
                                                                            </SelectItem>
                                                                            <SelectItem value="2">
                                                                                2
                                                                                -
                                                                                Medium
                                                                            </SelectItem>
                                                                            <SelectItem value="3">
                                                                                3
                                                                                -
                                                                                Hard
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={
                                                                dictationQuestionForm.control
                                                            }
                                                            name={`questions.${index}.type`}
                                                            render={({
                                                                field,
                                                            }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Type
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            {...field}
                                                                            disabled
                                                                            className="bg-muted"
                                                                        />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={
                                                            dictationQuestionForm.control
                                                        }
                                                        name={`questions.${index}.sectionIndex`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Assign to
                                                                    Section
                                                                </FormLabel>
                                                                <Select
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        field.onChange(
                                                                            Number(
                                                                                value,
                                                                            ),
                                                                        )
                                                                    }
                                                                    defaultValue={field.value?.toString()}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select section" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        {sectionFields.map(
                                                                            (
                                                                                _,
                                                                                idx,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    value={(
                                                                                        idx +
                                                                                        1
                                                                                    ).toString()}
                                                                                >
                                                                                    Section{' '}
                                                                                    {idx +
                                                                                        1}

                                                                                    :{' '}
                                                                                    {fullSectionForm.getValues(
                                                                                        `section.${idx}.title`,
                                                                                    )}
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={
                                                            dictationQuestionForm.control
                                                        }
                                                        name={`questions.${index}.audioUrl`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Audio URL
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="url"
                                                                        placeholder="https://example.com/audio.mp3"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={
                                                            dictationQuestionForm.control
                                                        }
                                                        name={`questions.${index}.script`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    Script
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Textarea
                                                                        {...field}
                                                                        placeholder="Enter the dictation script"
                                                                        rows={4}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full bg-transparent"
                                onClick={() =>
                                    appendQuestion({
                                        sectionIndex: 1,
                                        difficult: 1,
                                        type: 'Dictation',
                                        audioUrl: '',
                                        script: '',
                                    })
                                }
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>

                            <div className="flex justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(2)}
                                >
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            createQuestionsMutation.isPending
                                        }
                                    >
                                        {createQuestionsMutation.isPending
                                            ? 'Creating...'
                                            : 'Create Test'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
