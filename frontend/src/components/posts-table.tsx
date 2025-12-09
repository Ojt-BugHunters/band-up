'use client';

import * as React from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BlogPost } from '@/lib/service/blog';
import { useDeleteBlog } from '@/lib/service/blog';
import { useRouter } from 'next/navigation';

type TableBlogPost = {
    id: string;
    title: string;
    author: string;
    createdAt: string;
    status: 'published' | 'draft' | 'archived';
};

interface PostsTableProps {
    posts?: BlogPost[];
    isLoading?: boolean;
    errorMessage?: string;
}

export function PostsTable({ posts, isLoading, errorMessage }: PostsTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const router = useRouter();
    const deleteBlog = useDeleteBlog();
    const [pendingDeleteId, setPendingDeleteId] = React.useState<
        string | null
    >(null);

    const tableData = React.useMemo<TableBlogPost[]>(() => {
        if (!posts) {
            return [];
        }
        return posts.map((post) => ({
            id: post.id,
            title: post.title,
            author: post.author?.name ?? 'Unknown',
            createdAt: post.publishedDate ?? new Date().toISOString(),
            status: post.publishedDate ? 'published' : 'draft',
        }));
    }, [posts]);

    const handleEdit = React.useCallback(
        (blogId: string) => {
            router.push(`/blog/${blogId}/edit`);
        },
        [router],
    );

    const handleDelete = React.useCallback(
        (blogId: string) => {
            if (
                !window.confirm(
                    "Are you sure you want to delete this blog post?",
                )
            ) {
                return;
            }
            setPendingDeleteId(blogId);
            deleteBlog.mutate(blogId, {
                onSettled: () => setPendingDeleteId((prev) => (prev === blogId ? null : prev)),
            });
        },
        [deleteBlog],
    );

    const columns = React.useMemo<ColumnDef<TableBlogPost>[]>(() => {
        return [
            {
                accessorKey: 'title',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                    >
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="font-medium">{row.getValue('title')}</div>
                ),
            },
            {
                accessorKey: 'author',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                    >
                        Author
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => <div>{row.getValue('author')}</div>,
            },
            {
                accessorKey: 'createdAt',
                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                    >
                        Created At
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    const date = new Date(row.getValue('createdAt'));
                    return <div>{date.toLocaleDateString()}</div>;
                },
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: ({ row }) => {
                    const status = row.getValue('status') as string;
                    const statusColors: Record<string, string> = {
                        published: 'bg-green-100 text-green-800',
                        draft: 'bg-yellow-100 text-yellow-800',
                        archived: 'bg-gray-100 text-gray-800',
                    };
                    return (
                        <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status] || ''}`}
                        >
                            {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const post = row.original;
                    const isDeleting =
                        pendingDeleteId === post.id && deleteBlog.isPending;

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
                                    onClick={() => handleEdit(post.id)}
                                >
                                    <Edit2 className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleDelete(post.id)}
                                    className="text-red-600"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, [deleteBlog.isPending, handleDelete, handleEdit, pendingDeleteId]);
    const table = useReactTable({
        data: tableData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const tableStatusMessage = errorMessage
        ? errorMessage
        : isLoading
          ? 'Loading posts...'
          : 'No posts found.';

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search by title..."
                    value={
                        (table
                            .getColumn('title')
                            ?.getFilterValue() as string) ?? ''
                    }
                    onChange={(event) =>
                        table
                            .getColumn('title')
                            ?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
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
                                    {tableStatusMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}
