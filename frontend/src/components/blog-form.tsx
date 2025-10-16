import {
    CreateDeckFormValues,
    useCreateDeck,
} from '@/hooks/use-create-deck-card';
import { useUpdateDeck } from '@/hooks/use-update-deck-card';
import { useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

type DeckFormMode = 'create' | 'update';

type DeckFormProps = {
    mode: DeckFormMode;
    initialValues?: Partial<CreateDeckFormValues> & { id?: string };
    submitText?: string;
};

export default function BlogForm({
    mode,
    initialValues,
    submitText,
}: DeckFormProps) {
    const isUpdate = mode === 'update';
    const create = useCreateDeck();
    const update = useUpdateDeck(initialValues?.id ?? '');
    const { form, mutation } = isUpdate ? update : create;

    const safeDefaults: CreateDeckFormValues = useMemo(
        () => ({
            title: initialValues?.title ?? '',
            description: initialValues?.description ?? '',
            public: initialValues?.public ?? true,
            password: initialValues?.password ?? '',
            cards:
                initialValues?.cards && initialValues.cards.length > 0
                    ? initialValues.cards
                    : [{ front: '', back: '' }],
        }),
        [initialValues],
    );

    useEffect(() => {
        form.reset(safeDefaults, {
            keepDirty: false,
            keepTouched: false,
        });
    }, [isUpdate, safeDefaults, form]);

    const onSubmit = (data: CreateDeckFormValues) => {
        if (isUpdate && initialValues?.id) {
            mutation.mutate(data);
        } else {
            mutation.mutate(data);
        }
    };

    const pending = mutation.isPending;

    return (
        <div className="mx-auto max-w-6xl p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {isUpdate
                                    ? 'Update Blog'
                                    : 'Create New Blog'}{' '}
                            </h1>
                            <p className="text-muted-foreground">
                                {isUpdate
                                    ? 'Modify your blog'
                                    : 'Start creating your blog'}{' '}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={pending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {pending
                                    ? isUpdate
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : submitText ||
                                      (isUpdate ? 'Update' : 'Create')}{' '}
                            </Button>
                        </div>
                    </div>

                    <Card className="border-border bg-card p-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">
                                            Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter blog title..."
                                                className="bg-background text-lg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold">
                                            Description
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add a description..."
                                                className="bg-background min-h-[100px] resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
