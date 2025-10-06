import {
    CreateDeckFormValues,
    useCreateDeck,
} from '@/hooks/use-create-deck-card';
import { useFieldArray } from 'react-hook-form';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from './ui/form';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Eye, EyeOff, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CreateDeckForm() {
    const [showPassword, setShowPassword] = useState(false);
    const { form, mutation } = useCreateDeck();
    const isPublic = form.watch('public');
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'cards',
    });

    const onSubmit = (data: CreateDeckFormValues) => {
        mutation.mutate(data);
        console.log(data);
    };

    useEffect(() => {
        if (isPublic) {
            form.setValue('password', '', {
                shouldDirty: false,
                shouldTouch: false,
                shouldValidate: false,
            });
            form.clearErrors('password');
            setShowPassword(false);
        }
    }, [form, isPublic]);

    const addCard = () => {
        append({
            front: '',
            back: '',
        });
    };

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
                                Create New Deck
                            </h1>
                            <p className="text-muted-foreground">
                                Start building your flashcard collection
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {mutation.isPending
                                    ? 'Creating...'
                                    : 'Create & Study'}
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
                                                placeholder="Enter deck title..."
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

                            <div className="border-border bg-background flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold">
                                        Public Deck
                                    </FormLabel>
                                    <p className="text-muted-foreground text-sm">
                                        Make this deck visible to everyone
                                    </p>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="public"
                                    render={({ field }) => (
                                        <FormControl>
                                            <Switch
                                                checked={!!field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    )}
                                />
                            </div>

                            {!isPublic && (
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold">
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={
                                                            showPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="Set a password for private access..."
                                                        className="bg-background"
                                                        {...field}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                !showPassword,
                                                            )
                                                        }
                                                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4" />
                                                        ) : (
                                                            <Eye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Cards ({fields.length})
                            </h2>
                            <Button
                                type="button"
                                onClick={addCard}
                                variant="outline"
                                size="sm"
                                className="gap-2 bg-transparent"
                            >
                                <Plus className="h-4 w-4" />
                                Add Card
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <Card
                                    key={field.id}
                                    className="border-border bg-card p-6 transition-all hover:shadow-md"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="text-muted-foreground h-5 w-5" />
                                                <span className="text-lg font-semibold">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            {fields.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        remove(index)
                                                    }
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name={`cards.${index}.front`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                                            Front
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Enter term or question..."
                                                                className="bg-background min-h-[120px] resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name={`cards.${index}.back`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                                                            Back
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Enter definition or answer..."
                                                                className="bg-background min-h-[120px] resize-none"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {fields.length < 99 && (
                            <Button
                                type="button"
                                onClick={addCard}
                                variant="outline"
                                className="w-full border-dashed bg-transparent py-8 text-base"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Add Another Card
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
