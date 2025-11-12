// components/async-select.tsx
'use client';

import * as React from 'react';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export interface AsyncSelectProps<T> {
    useOptions: () => {
        data?: T[];
        isLoading: boolean;
        isError: boolean;
        error?: unknown;
    };

    getOptionValue: (option: T) => string;
    renderOption: (option: T) => React.ReactNode;
    getDisplayValue: (option: T) => React.ReactNode;

    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;

    clearable?: boolean;
    visibleCount?: number;
    disabled?: boolean;
    width?: string | number;
    className?: string;
    triggerClassName?: string;

    filterFn?: (option: T, query: string) => boolean;
    noResultsMessage?: string;
    notFound?: React.ReactNode;
    loadingSkeleton?: React.ReactNode;
}

export function AsyncSelect<T>({
    useOptions,
    getOptionValue,
    renderOption,
    getDisplayValue,
    label,
    placeholder = 'Select...',
    value,
    onChange,
    clearable = true,
    visibleCount = 5,
    disabled = false,
    width = '260px',
    className,
    triggerClassName,
    filterFn,
    noResultsMessage,
    notFound,
    loadingSkeleton,
}: AsyncSelectProps<T>) {
    // ✅ Gọi hook được truyền vào ngay trong thân component (top-level)
    const { data, isLoading, isError, error } = useOptions();

    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debounced = useDebounce(searchTerm, 200);

    const selectedOption = useMemo(() => {
        if (!data || !value) return null;
        return data.find((o) => getOptionValue(o) === value) ?? null;
    }, [data, value, getOptionValue]);

    const filtered = useMemo(() => {
        if (!data) return [];
        const q = debounced.trim().toLowerCase();
        if (!q) return data;

        if (filterFn) return data.filter((o) => filterFn(o, q));

        return data.filter((o) => {
            try {
                const node = getDisplayValue(o);
                const text =
                    typeof node === 'string' ? node : getOptionValue(o);
                return text.toLowerCase().includes(q);
            } catch {
                return getOptionValue(o).toLowerCase().includes(q);
            }
        });
    }, [data, debounced, filterFn, getDisplayValue, getOptionValue]);

    const shown = useMemo(() => {
        if (!debounced) return filtered.slice(0, visibleCount);
        return filtered;
    }, [filtered, debounced, visibleCount]);

    const handleSelect = useCallback(
        (currentValue: string) => {
            const newValue =
                clearable && currentValue === value ? '' : currentValue;
            onChange(newValue);
            setOpen(false);
        },
        [onChange, value, clearable],
    );

    useEffect(() => {
        if (!open) setSearchTerm('');
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'justify-between',
                        disabled && 'opacity-50',
                        triggerClassName,
                    )}
                    style={{ width }}
                    disabled={disabled}
                >
                    {selectedOption
                        ? getDisplayValue(selectedOption)
                        : placeholder}
                    <ChevronsUpDown
                        className="ml-2 shrink-0 opacity-50"
                        size={14}
                    />
                </Button>
            </PopoverTrigger>

            <PopoverContent style={{ width }} className={cn('p-0', className)}>
                <Command shouldFilter={false}>
                    <div className="relative w-full border-b">
                        <CommandInput
                            placeholder={`Search ${label.toLowerCase()}...`}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        {isLoading && !!data?.length && (
                            <div className="absolute top-1/2 right-2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                        )}
                    </div>

                    <CommandList>
                        {isError && (
                            <div className="text-destructive p-3 text-center text-sm">
                                {(error as Error)?.message ??
                                    'Failed to load options'}
                            </div>
                        )}

                        {isLoading &&
                            !data?.length &&
                            (loadingSkeleton || <DefaultLoadingSkeleton />)}

                        {!isLoading &&
                            !isError &&
                            shown.length === 0 &&
                            (notFound || (
                                <CommandEmpty>
                                    {noResultsMessage ??
                                        `No ${label.toLowerCase()} found.`}
                                </CommandEmpty>
                            ))}

                        <CommandGroup>
                            {shown.map((option) => {
                                const optVal = getOptionValue(option);
                                const selected = value === optVal;
                                return (
                                    <CommandItem
                                        key={optVal}
                                        value={optVal}
                                        onSelect={handleSelect}
                                    >
                                        {renderOption(option)}
                                        <Check
                                            className={cn(
                                                'ml-auto h-3 w-3',
                                                selected
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>

                        {!debounced &&
                            !!filtered.length &&
                            filtered.length > (visibleCount ?? 5) && (
                                <div className="text-muted-foreground px-3 py-2 text-xs">
                                    Type to search more…
                                </div>
                            )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

function DefaultLoadingSkeleton() {
    return (
        <CommandGroup>
            {[1, 2, 3].map((i) => (
                <CommandItem key={i} disabled>
                    <div className="flex w-full items-center gap-2">
                        <div className="bg-muted h-6 w-6 animate-pulse rounded-full" />
                        <div className="flex flex-1 flex-col gap-1">
                            <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                            <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                        </div>
                    </div>
                </CommandItem>
            ))}
        </CommandGroup>
    );
}
