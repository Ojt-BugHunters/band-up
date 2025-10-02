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
import { Loader2 } from 'lucide-react';

export default function CreateDeckPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="container mx-auto max-w-2xl py-12 md:py-16">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Create New Deck
                        </h1>
                        <p className="text-muted-foreground text-sm md:text-base">
                            Fill in the details below to create your new deck.
                        </p>
                    </div>

                    <div className="bg-card rounded-2xl border p-6 shadow-sm md:p-8">
                        <CreateDeckForm />
                    </div>
                </div>
            </div>
        </div>
    );
}

const CreateDeckForm = () => {
    const { form, mutation } = useCreateDeck();

    return (
        <Form {...form}>
            <form
                className="flex flex-col gap-6"
                onSubmit={form.handleSubmit((values) =>
                    mutation.mutate(values),
                )}
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm">Title</FormLabel>
                            <Input
                                placeholder="Enter deck title"
                                className="h-11"
                                {...field}
                            />
                            <FormDescription className="text-muted-foreground text-xs leading-relaxed">
                                Give your deck a descriptive title (3–100
                                characters).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm">
                                Description
                            </FormLabel>
                            <Textarea
                                placeholder="Enter deck description"
                                className="min-h-[140px] resize-none"
                                rows={5}
                                {...field}
                            />
                            <FormDescription className="text-muted-foreground text-xs leading-relaxed">
                                Provide a concise, helpful summary of your deck
                                (10–500 characters).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {mutation.status === 'pending' ? (
                    <Button disabled className="w-full cursor-pointer">
                        <Loader2 className="animate-spin" />
                        Loading
                    </Button>
                ) : (
                    <Button type="submit" className="w-full cursor-pointer">
                        Create Deck
                    </Button>
                )}
            </form>
        </Form>
    );
};
