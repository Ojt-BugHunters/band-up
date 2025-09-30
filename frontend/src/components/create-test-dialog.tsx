'use client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { TestType } from '@/lib/api/dto/create-test';
import { BookOpen, Headphones, Mic, PenTool, Clock } from 'lucide-react';
import { useCreateTest } from '@/hooks/use-create-test';
import { useEffect } from 'react';

const testTypeIcons = {
    reading: BookOpen,
    listening: Headphones,
    writing: PenTool,
    speaking: Mic,
};

const testTypeLabels = {
    reading: 'Reading',
    listening: 'Listening',
    writing: 'Writing',
    speaking: 'Speaking',
};

export function CreateTestDialog({
    open,
    onOpenChange,
    skillName,
    displayName,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    skillName: TestType;
    displayName: string;
}) {
    const { form } = useCreateTest();
    const Icon = testTypeIcons[skillName];

    useEffect(() => {
        if (open) {
            form.reset({
                skillName,
                title: '',
                durationSeconds: 3600,
            });
        }
    }, [open, skillName, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="mb-2 flex items-center gap-3">
                        <div className="bg-muted rounded-lg p-2">
                            <Icon className="text-foreground h-5 w-5" />
                        </div>
                        <DialogTitle className="text-2xl">
                            Create {testTypeLabels[skillName]} Test
                        </DialogTitle>
                    </div>
                    <DialogDescription>
                        Fill in the details below to create a new{' '}
                        {testTypeLabels[skillName].toLowerCase()} test.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={() => {
                            console.log('Submit successfully');
                        }}
                        className="mt-4 space-y-6"
                    >
                        <FormField
                            control={form.control}
                            name="skillName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Skill Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={displayName}
                                            disabled
                                            className="bg-muted"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The skill type is automatically set
                                        based on your selection.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Test Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={`e.g., ${testTypeLabels[skillName]} Comprehension Test - Level 1`}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Give your test a descriptive title.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="durationSeconds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (seconds)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                            <Input
                                                type="number"
                                                placeholder="3600"
                                                className="pl-10"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Set the test duration in seconds
                                        (60-7200).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="submit">Create Test</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
