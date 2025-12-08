'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useGetAccounts, type User } from '@/lib/service/account';

const numberFormatter = new Intl.NumberFormat('en-US');
const PAGE_SIZE = 20;

const formatDate = (value?: string | null) => {
    if (!value) {
        return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatPlan = (user: User) =>
    user.subscription?.subscriptionType ?? null;

const statusStyle: Record<'active' | 'inactive', { label: string; variant: string }> = {
    active: { label: 'Active', variant: 'bg-emerald-100 text-emerald-800' },
    inactive: { label: 'Inactive', variant: 'bg-slate-100 text-slate-800' },
};

export default function AdminUsersPage() {
    const [page, setPage] = useState(0);
    const query = useMemo(
        () => ({
            page,
            size: PAGE_SIZE,
            sortBy: 'createdAt',
            direction: 'DESC' as const,
        }),
        [page],
    );

    const {
        data,
        isLoading,
        isFetching,
        error,
    } = useGetAccounts(query);

    useEffect(() => {
        if (data && data.totalPages > 0 && page > data.totalPages - 1) {
            setPage(data.totalPages - 1);
        }
    }, [data, page]);

    const users = data?.content ?? [];
    const totalUsers = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 1;
    const isBusy = isLoading || isFetching;
    const pageStart = users.length ? page * PAGE_SIZE + 1 : 0;
    const pageEnd = users.length ? pageStart + users.length - 1 : 0;
    const errorMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : undefined;

    const { activeCount, premiumCount, inactiveCount } = useMemo(() => {
        let active = 0;
        let premium = 0;
        let inactive = 0;
        users.forEach((account) => {
            const isActive =
                account.isActive ?? account.active ?? false;
            if (isActive) {
                active += 1;
            } else {
                inactive += 1;
            }
            if (account.subscription) {
                premium += 1;
            }
        });
        return {
            activeCount: active,
            premiumCount: premium,
            inactiveCount: inactive,
        };
    }, [users]);

    return (
        <div className="m-4 mt-2 space-y-6">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Users Management
                    </h1>
                    <p className="text-muted-foreground">
                        Overview, search and moderation tools for platform
                        members.
                    </p>
                </div>
            </div>

            {errorMessage && (
                <p className="text-destructive text-sm">
                    Không thể tải danh sách tài khoản: {errorMessage}
                </p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>
                            Synced from the account service
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {numberFormatter.format(totalUsers)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Includes all registered members.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Accounts</CardTitle>
                        <CardDescription>
                            Accounts currently active on this page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {numberFormatter.format(activeCount)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Reflects the current account status reported.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Premium Subscribers</CardTitle>
                        <CardDescription>
                            Subscriptions visible in the current page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {numberFormatter.format(premiumCount)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Free plan users excluded automatically.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Inactive Accounts</CardTitle>
                        <CardDescription>
                            Accounts marked inactive in this page
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {numberFormatter.format(inactiveCount)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Useful for follow-up or moderation.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Directory</CardTitle>
                    <CardDescription>
                        Full list of current users and account information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">
                                        User
                                    </TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Birthday</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                                            {isBusy ? (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                    <span>Đang tải...</span>
                                                </div>
                                            ) : (
                                                'Không tìm thấy người dùng.'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => {
                                        const isActive =
                                            user.isActive ??
                                            user.active ??
                                            false;
                                        const status = isActive
                                            ? 'active'
                                            : 'inactive';
                                        const plan = formatPlan(user);

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {user.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.role}</TableCell>
                                                <TableCell>{plan}</TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>{user.address}</TableCell>
                                                <TableCell>
                                                    {formatDate(user.birthday)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(user.createdAt)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            statusStyle[status]
                                                                .variant
                                                        }
                                                    >
                                                        {
                                                            statusStyle[status]
                                                                .label
                                                        }
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-3 pt-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                        <p>
                            {totalUsers
                                ? `Showing ${pageStart}-${pageEnd} of ${numberFormatter.format(totalUsers)} users`
                                : 'No users to display'}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((current) =>
                                        Math.max(current - 1, 0),
                                    )
                                }
                                disabled={page === 0 || isBusy}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setPage((current) => current + 1)
                                }
                                disabled={page + 1 >= totalPages || isBusy}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
