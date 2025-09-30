import { ReadingPassage, ReadingQuestion } from '@/lib/api/dto/create-test';
import {
    BookOpen,
    Check,
    Edit,
    HelpCircle,
    ImageIcon,
    Plus,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import { ReadingQuestionType } from '@/lib/api/dto/question';

const READING_PASSAGE_COUNT = 3;
const READING_QUESTION_TYPES: {
    value: ReadingQuestionType;
    label: string;
}[] = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'true-false', label: 'True/False/Not Given' },
    { value: 'completion', label: 'Sentence/Summary Completion' },
];
interface ReadingContentFormProps {
    passages: ReadingPassage[];
    onPassagesUpdate: (passage: ReadingPassage[]) => void;
}

interface ReadingQuestionFormProps {
    passages: ReadingPassage[];
    questions: ReadingQuestion[];
    onQuestionsUpdate: (questions: ReadingQuestion[]) => void;
}

export function ReadingContentForm({
    passages,
    onPassagesUpdate,
}: ReadingContentFormProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<ReadingPassage>>({});

    const handleAddPassage = () => {
        if (passages.length >= READING_PASSAGE_COUNT) return;

        const newPassage: ReadingPassage = {
            id: `passage-${Date.now()}`,
            title: '',
            content: '',
            image: '',
        };

        setEditingIndex(passages.length);
        setEditForm(newPassage);
        onPassagesUpdate([...passages, newPassage]);
    };

    const handleEditPassage = (index: number) => {
        setEditingIndex(index);
        setEditForm(passages[index]);
    };

    const handleDeletePassage = (index: number) => {
        const updatedPassages = passages.filter((_, i) => i !== index);
        onPassagesUpdate(updatedPassages);
    };

    const handleSavePassage = () => {
        if (editingIndex === null) return;

        const updatedPassages = [...passages];
        updatedPassages[editingIndex] = editForm as ReadingPassage;
        onPassagesUpdate(updatedPassages);
        setEditingIndex(null);
        setEditForm({});
    };

    const isFormValid = editForm.title?.trim() && editForm.content?.trim();

    const handleCancelEdit = () => {
        if (
            editingIndex !== null &&
            editForm.title === '' &&
            editForm.content === ''
        ) {
            const updatedPassages = passages.filter(
                (_, index) => index !== editingIndex,
            );
            onPassagesUpdate(updatedPassages);
        }
        setEditingIndex(null);
        setEditForm({});
    };
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Reading Test Content
                </h3>
                <p className="text-muted-foreground">
                    Add 3 reading passages with titles and content. Each passage
                    will be used to create comprehension questions.
                </p>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Passages</span>
                    <Badge variant="secondary">
                        {passages.length} / {READING_PASSAGE_COUNT}
                    </Badge>
                </div>

                {passages.length < READING_PASSAGE_COUNT && (
                    <Button
                        onClick={handleAddPassage}
                        className="round-lg bg-blue-600 hover:bg-blue-700"
                        size="sm"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Passage
                    </Button>
                )}
            </div>
            <div className="space-y-4">
                {passages.map((passage, index) => (
                    <Card key={passage.id} className="border-border border">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-medium">
                                        Passage {index + 1}
                                        {passage.title && `: ${passage.title}`}
                                    </CardTitle>
                                    <CardDescription className="text-sm">
                                        {passage.content
                                            ? `${passage.content.length} characters`
                                            : 'No content added'}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingIndex !== index && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleEditPassage(index)
                                                }
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleDeletePassage(index)
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        {editingIndex === index ? (
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`title-${index}`}>
                                        Passage Title
                                    </Label>
                                    <Input
                                        id={`title-${index}`}
                                        value={editForm.title || ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Enter passage title..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`content-${index}`}>
                                        Passage Content
                                    </Label>
                                    <Textarea
                                        id={`content-${index}`}
                                        value={editForm.content || ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                content: e.target.value,
                                            })
                                        }
                                        placeholder="Enter the reading passage content..."
                                        className="min-h-[200px] resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor={`image-${index}`}>
                                        Image URL (Optional)
                                    </Label>
                                    <Input
                                        id={`image-${index}`}
                                        value={editForm.image || ''}
                                        onChange={(e) =>
                                            setEditForm({
                                                ...editForm,
                                                image: e.target.value,
                                            })
                                        }
                                        placeholder="Enter image URL..."
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button
                                        onClick={handleSavePassage}
                                        disabled={!isFormValid}
                                        className="bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        size="sm"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent>
                                {passage.content && (
                                    <div className="text-muted-foreground line-clamp-3 text-sm">
                                        {passage.content}
                                    </div>
                                )}
                            </CardContent>
                        )}
                    </Card>
                ))}
                {passages.length === 0 && (
                    <div className="border-border rounded-lg border-2 border-dashed py-12 text-center">
                        <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                        <h4 className="text-foreground mb-2 font-medium">
                            No passages added yet
                        </h4>
                        <p className="text-muted-foreground mb-4">
                            Add your first reading passage to get started
                        </p>
                        <Button
                            onClick={handleAddPassage}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Passage
                        </Button>
                    </div>
                )}
            </div>
            {passages.length === READING_PASSAGE_COUNT && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-2 text-green-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">All passages added!</span>
                    </div>
                    <p className="mt-1 text-sm text-green-600">
                        You can now proceed to add questions for each passage.
                    </p>
                </div>
            )}
        </div>
    );
}

export function ReadingQuestionForm({
    passages,
    questions,
    onQuestionsUpdate,
}: ReadingQuestionFormProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<ReadingQuestion>>({});
    const [selectedPassageId, setSelectedPassageId] = useState<string>('');

    const handleAddQuestion = (passageId: string) => {
        const newQuestion: ReadingQuestion = {
            id: `question-${Date.now()}`,
            title: '',
            content: '',
            image: '',
            type: 'multiple-choice',
            passageId,
        };

        setEditingIndex(questions.length);
        setEditForm(newQuestion);
        setSelectedPassageId(passageId);
        onQuestionsUpdate([...questions, newQuestion]);
    };

    const handleEditQuestion = (index: number) => {
        setEditingIndex(index);
        setEditForm(questions[index]);
        setSelectedPassageId(questions[index].passageId);
    };

    const handleSaveQuestion = () => {
        if (editingIndex === null) return;

        const updatedQuestions = [...questions];
        updatedQuestions[editingIndex] = editForm as ReadingQuestion;
        onQuestionsUpdate(updatedQuestions);
        setEditingIndex(null);
        setEditForm({});
        setSelectedPassageId('');
    };

    const handleCancelEdit = () => {
        if (
            editingIndex !== null &&
            editForm.title === '' &&
            editForm.content === ''
        ) {
            const updatedQuestions = questions.filter(
                (_, index) => index !== editingIndex,
            );
            onQuestionsUpdate(updatedQuestions);
        }
        setEditingIndex(null);
        setEditForm({});
        setSelectedPassageId('');
    };

    const handleDeleteQuestion = (index: number) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        onQuestionsUpdate(updatedQuestions);
    };

    const getQuestionsForPassage = (passageId: string) => {
        return questions.filter((q) => q.passageId === passageId);
    };

    const getPassageTitle = (passageId: string) => {
        const passage = passages.find((p) => p.id === passageId);
        return passage?.title || 'Untitled Passage';
    };

    const isFormValid =
        editForm.title?.trim() && editForm.content?.trim() && editForm.type;

    if (passages.length === 0) {
        return (
            <div className="py-12 text-center">
                <HelpCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <h4 className="text-foreground mb-2 font-medium">
                    No passages available
                </h4>
                <p className="text-muted-foreground">
                    Please add reading passages first before creating questions.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-foreground mb-2 text-lg font-semibold">
                    Reading Questions
                </h3>
                <p className="text-muted-foreground">
                    Create questions for each reading passage. Questions should
                    test comprehension and understanding.
                </p>
            </div>

            <div className="space-y-6">
                {passages.map((passage, passageIndex) => {
                    const passageQuestions = getQuestionsForPassage(passage.id);

                    return (
                        <Card key={passage.id} className="border-border border">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-medium">
                                            Passage {passageIndex + 1}:{' '}
                                            {passage.title}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            {passageQuestions.length} questions
                                            created
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            handleAddQuestion(passage.id)
                                        }
                                        className="bg-blue-600 hover:bg-blue-700"
                                        size="sm"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {passageQuestions.map(
                                    (question, questionIndex) => {
                                        const globalIndex = questions.findIndex(
                                            (q) => q.id === question.id,
                                        );

                                        return (
                                            <Card
                                                key={question.id}
                                                className="border-border/50 border"
                                            >
                                                <CardHeader className="pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    READING_QUESTION_TYPES.find(
                                                                        (t) =>
                                                                            t.value ===
                                                                            question.type,
                                                                    )?.label
                                                                }
                                                            </Badge>
                                                            <span className="text-sm font-medium">
                                                                Question{' '}
                                                                {questionIndex +
                                                                    1}
                                                                {question.title &&
                                                                    `: ${question.title}`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {editingIndex !==
                                                                globalIndex && (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleEditQuestion(
                                                                                globalIndex,
                                                                            )
                                                                        }
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleDeleteQuestion(
                                                                                globalIndex,
                                                                            )
                                                                        }
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                {editingIndex ===
                                                globalIndex ? (
                                                    <CardContent className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`q-title-${globalIndex}`}
                                                                >
                                                                    Question
                                                                    Title
                                                                </Label>
                                                                <Input
                                                                    id={`q-title-${globalIndex}`}
                                                                    value={
                                                                        editForm.title ||
                                                                        ''
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditForm(
                                                                            {
                                                                                ...editForm,
                                                                                title: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Enter question title..."
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label
                                                                    htmlFor={`q-type-${globalIndex}`}
                                                                >
                                                                    Question
                                                                    Type
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        editForm.type ||
                                                                        ''
                                                                    }
                                                                    onValueChange={(
                                                                        value,
                                                                    ) =>
                                                                        setEditForm(
                                                                            {
                                                                                ...editForm,
                                                                                type: value as ReadingQuestionType,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select question type" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {READING_QUESTION_TYPES.map(
                                                                            (
                                                                                type,
                                                                            ) => (
                                                                                <SelectItem
                                                                                    key={
                                                                                        type.value
                                                                                    }
                                                                                    value={
                                                                                        type.value
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        type.label
                                                                                    }
                                                                                </SelectItem>
                                                                            ),
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`q-content-${globalIndex}`}
                                                            >
                                                                Question Content
                                                            </Label>
                                                            <Textarea
                                                                id={`q-content-${globalIndex}`}
                                                                value={
                                                                    editForm.content ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            content:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Enter the question content, instructions, and answer choices..."
                                                                className="min-h-[120px] resize-none"
                                                            />
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label
                                                                htmlFor={`q-image-${globalIndex}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <ImageIcon className="h-4 w-4" />
                                                                    Supporting
                                                                    Image URL
                                                                    (Optional)
                                                                </div>
                                                            </Label>
                                                            <Input
                                                                id={`q-image-${globalIndex}`}
                                                                value={
                                                                    editForm.image ||
                                                                    ''
                                                                }
                                                                onChange={(e) =>
                                                                    setEditForm(
                                                                        {
                                                                            ...editForm,
                                                                            image: e
                                                                                .target
                                                                                .value,
                                                                        },
                                                                    )
                                                                }
                                                                placeholder="Enter image URL..."
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2 pt-2">
                                                            <Button
                                                                onClick={
                                                                    handleSaveQuestion
                                                                }
                                                                disabled={
                                                                    !isFormValid
                                                                }
                                                                className="bg-green-600 hover:bg-green-700"
                                                                size="sm"
                                                            >
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Save
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={
                                                                    handleCancelEdit
                                                                }
                                                                size="sm"
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                ) : (
                                                    <CardContent>
                                                        {question.content && (
                                                            <div className="text-muted-foreground line-clamp-2 text-sm">
                                                                {
                                                                    question.content
                                                                }
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                )}
                                            </Card>
                                        );
                                    },
                                )}

                                {passageQuestions.length === 0 && (
                                    <div className="border-border rounded-lg border-2 border-dashed py-8 text-center">
                                        <HelpCircle className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                                        <p className="text-muted-foreground mb-3 text-sm">
                                            No questions added for this passage
                                            yet
                                        </p>
                                        <Button
                                            onClick={() =>
                                                handleAddQuestion(passage.id)
                                            }
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Question
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {questions.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">
                            {questions.length} questions created
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-blue-600">
                        Questions have been added across all passages. Review
                        and create your test when ready.
                    </p>
                </div>
            )}
        </div>
    );
}
