'use client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { CreateRoomFormValues, useCreateRoom } from '@/lib/service/room';

interface createRoomDialogProps {
    createDialogOpen: boolean;
    setCreateDialogOpen: (show: boolean) => void;
}

export function CreateRoomDialog({
    createDialogOpen,
    setCreateDialogOpen,
}: createRoomDialogProps) {
    const { form, mutation } = useCreateRoom();

    const onSubmit = (values: CreateRoomFormValues) => {
        mutation.mutate(values, {
            onSuccess: () => {
                setCreateDialogOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-white/20 bg-gradient-to-r from-rose-400/90 to-pink-400/90 text-white shadow-lg shadow-rose-500/30 backdrop-blur-md transition-all hover:scale-105 hover:from-rose-500 hover:to-pink-500"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="rounded-3xl border-zinc-700/50 bg-zinc-900/95 text-white backdrop-blur-xl sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Create New Room
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6 py-4"
                    >
                        <FormField
                            control={form.control}
                            name="roomName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">
                                        Room Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="English room"
                                            className="rounded-xl border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-white/50"
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
                                            placeholder="What's this room about?"
                                            className="min-h-[100px] rounded-xl border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-white/50"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-white/70">
                                        The system will use default value if
                                        this field is none
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="privateRoom"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-800/40 px-4 py-3">
                                    <div className="space-y-1">
                                        <FormLabel className="text-base font-semibold">
                                            Private Room
                                        </FormLabel>
                                        <FormDescription className="text-white/70">
                                            Only invited members can join
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="transition-colors data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-zinc-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={
                                mutation.isPending || !form.formState.isValid
                            }
                            className="w-full rounded-xl bg-rose-400 text-white hover:bg-rose-500 disabled:opacity-60"
                            size="lg"
                        >
                            {mutation.isPending ? 'Creating...' : 'Create Room'}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
