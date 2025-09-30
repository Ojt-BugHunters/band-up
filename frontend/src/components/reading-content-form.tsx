import { ReadingPassage } from '@/lib/api/dto/create-test';
import { BookOpen, Check, Edit, Plus, Trash2, X } from 'lucide-react';
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

interface ReadingContentFormProps {
    passages: ReadingPassage[];
    onPassagesUpdate: (passage: ReadingPassage[]) => void;
}

const READING_PASSAGE_COUNT = 3;

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
