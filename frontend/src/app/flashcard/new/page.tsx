'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useCreateDeck } from '@/hooks/use-create-deck';

export default function CreateDeckPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New Deck
                    </h1>
                    <p className="text-muted-foreground">
                        Fill in the details below to create your new deck
                    </p>
                </div>

                <div className="bg-card rounded-lg border p-6">
                    <CreateDeckForm />
                </div>
            </div>
        </div>
    );
}

const CreateDeckForm = () => {
    const { form, onSubmit } = useCreateDeck();

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <Input placeholder="Enter deck title" {...field} />
                            <FormDescription>
                                Give your deck a descriptive title (3-100
                                characters)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <Textarea
                                placeholder="Enter deck description"
                                className="min-h-[120px] resize-none"
                                {...field}
                            />
                            <FormDescription>
                                Provide a detailed description of your deck
                                (10-500 characters)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting
                        ? 'Creating...'
                        : 'Create Deck'}
                </Button>
            </form>
        </Form>
    );
};
