'use client';

import * as React from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import {
    ArrowUpDown,
    ChevronDown,
    MoreHorizontal,
    Plus,
    Pencil,
    Trash2,
    Eye,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Deck, useGetDecks } from '@/lib/service/flashcard';
import { useDebounce } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

export const columns: ColumnDef<Deck>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Deck Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('title')}</div>
        ),
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <div className="text-muted-foreground max-w-[300px] truncate">
                {row.getValue('description')}
            </div>
        ),
    },
    {
        accessorKey: 'authorName',
        header: 'Author',
        cell: ({ row }) => <div>{row.getValue('authorName')}</div>,
    },
    {
        accessorKey: 'learnerNumber',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <Users className="mr-2 h-4 w-4" />
                    Learners
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const learners = row.getValue('learnerNumber') as number;
            return (
                <div className="text-center font-medium">
                    {learners.toLocaleString()}
                </div>
            );
        },
    },
    {
        accessorKey: 'public',
        header: 'Visibility',
        cell: ({ row }) => {
            const isPublic = row.getValue('public') as boolean;
            return (
                <Badge variant={isPublic ? 'default' : 'secondary'}>
                    {isPublic ? 'Public' : 'Private'}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.getValue('createdAt'));
            return <div>{date.toLocaleDateString()}</div>;
        },
    },
    {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
            const deck = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => console.log('View deck:', deck.id)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => console.log('Edit deck:', deck.id)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Deck
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() =>
                                navigator.clipboard.writeText(deck.id)
                            }
                        >
                            Copy Deck ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => console.log('Delete deck:', deck.id)}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Deck
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export function FlashcardTable() {
    const [search, setSearch] = React.useState('');
    const [visibilityFilter, setVisibilityFilter] =
        React.useState<'all' | 'public' | 'private'>('all');
    const [pageIndex, setPageIndex] = React.useState(0);
    const pageSize = 10;
    const debouncedSearch = useDebounce(search, 400);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    React.useEffect(() => {
        setPageIndex(0);
    }, [debouncedSearch, visibilityFilter]);

    const paginationInfo = React.useMemo(
        () => ({
            pageNo: pageIndex,
            pageSize,
            sortBy: 'createdAt',
            ascending: false,
            queryBy: debouncedSearch.trim(),
            visibility:
                (visibilityFilter === 'all' ? '' : visibilityFilter) as
                    | ''
                    | 'public'
                    | 'private',
        }),
        [pageIndex, pageSize, debouncedSearch, visibilityFilter],
    );

    const { data, isPending, isFetching, error } = useGetDecks(paginationInfo);
    const decks = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;
    const totalPages =
        totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;
    const isLoading = isPending || isFetching;
    const errorMessage = error instanceof Error ? error.message : undefined;

    React.useEffect(() => {
        if (isLoading) return;
        if (totalPages === 0 && pageIndex !== 0) {
            setPageIndex(0);
            return;
        }
        if (totalPages > 0 && pageIndex > totalPages - 1) {
            setPageIndex(totalPages - 1);
        }
    }, [totalPages, pageIndex, isLoading]);

    const table = useReactTable({
        data: decks,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    return (
        <div className="w-full">
            {errorMessage && (
                <div className="text-destructive mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                    Failed to load flashcards: {errorMessage}
                </div>
            )}
            <div className="flex items-center justify-between gap-4 py-4">
                <Input
                    placeholder="Filter decks by title..."
                    value={search}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearch(value);
                        table.getColumn('title')?.setFilterValue(value);
                    }}
                    className="max-w-sm"
                />
                <Select
                    value={visibilityFilter}
                    onValueChange={(value) =>
                        setVisibilityFilter(
                            value as 'all' | 'public' | 'private',
                        )
                    }
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All decks</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                    <Link href="/flashcard/new">
                        <Button className="bg-primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Deck
                        </Button>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="bg-transparent"
                            >
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-sm text-muted-foreground"
                                >
                                    Loading flashcards...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <span className="text-muted-foreground text-sm">
                        Page {totalPages === 0 ? 0 : pageIndex + 1} of{' '}
                        {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPageIndex((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={pageIndex === 0 || isLoading}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setPageIndex((prev) =>
                                totalPages === 0
                                    ? prev
                                    : Math.min(prev + 1, totalPages - 1),
                            )
                        }
                        disabled={
                            isLoading ||
                            totalPages === 0 ||
                            pageIndex >= totalPages - 1
                        }
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
