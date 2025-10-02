'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { useProfile } from '@/hooks/use-profile-register';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';

export default function RegisterPage() {
    return (
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ProfileForm />
            </div>
        </div>
    );
}

const ProfileForm = ({ className, ...props }: React.ComponentProps<'div'>) => {
    const { form, mutation } = useProfile();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <Image
                        src="/logo.png"
                        alt="BandUp Logo"
                        width={65}
                        height={65}
                    />
                    <h1 className="text-xl font-bold">
                        Complete your BandUp profile
                    </h1>
                </div>
                <Form {...form}>
                    <form
                        className="space-y-4 p-6 md:p-8"
                        onSubmit={form.handleSubmit((values) =>
                            mutation.mutate(values),
                        )}
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your full name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            placeholder="johndoe"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Birthday</FormLabel>
                                        <Popover
                                            open={isCalendarOpen}
                                            onOpenChange={setIsCalendarOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-full pl-3 text-left font-normal',
                                                        !field.value &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'dd/MM/yyyy',
                                                            { locale: vi },
                                                        )
                                                    ) : (
                                                        <span>dd/mm/yyyy</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={
                                                        field.value
                                                            ? new Date(
                                                                  field.value,
                                                              )
                                                            : undefined
                                                    }
                                                    onSelect={(date) => {
                                                        field.onChange(date);
                                                        setIsCalendarOpen(
                                                            false,
                                                        );
                                                    }}
                                                    disabled={(date) =>
                                                        date > new Date() ||
                                                        date <
                                                            new Date(
                                                                '1900-01-01',
                                                            )
                                                    }
                                                    initialFocus
                                                    captionLayout="dropdown"
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Gender</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">
                                                    Male
                                                </SelectItem>
                                                <SelectItem value="Female">
                                                    Female
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your phone number</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            placeholder="087123456"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your address</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            placeholder="123 Johndoe st. LA"
                                        />
                                    </FormControl>
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
                            <Button
                                type="submit"
                                className="mt-4 w-full cursor-pointer"
                            >
                                Submit
                            </Button>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    );
};
