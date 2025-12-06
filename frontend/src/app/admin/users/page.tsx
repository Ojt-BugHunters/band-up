'use client';

import Link from 'next/link';
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
import type { User } from '@/lib/service/account';

type AdminUserRecord = User & {
    username: string;
    plan: 'Free' | 'Premium' | 'Enterprise';
    joinedAt: string;
    lastActive: string;
    status: 'active' | 'inactive' | 'flagged';
};

const adminUsers: AdminUserRecord[] = [
    {
        id: 'USR-001',
        name: 'Nam Dang',
        email: 'namdangcoder@gmail.com',
        phone: '0123 456 789',
        gender: 'Male',
        role: 'Administrator',
        address: 'Ho Chi Minh City, Vietnam',
        birthday: new Date('1995-04-12'),
        isActive: true,
        username: 'namdang',
        plan: 'Premium',
        joinedAt: '2023-02-18T09:00:00Z',
        lastActive: '2025-02-18T08:32:00Z',
        status: 'active',
    },
    {
        id: 'USR-002',
        name: 'Trang Nguyen',
        email: 'trang.nguyen@example.com',
        phone: '0987 654 321',
        gender: 'Female',
        role: 'Content Manager',
        address: 'Da Nang, Vietnam',
        birthday: new Date('1993-08-25'),
        isActive: true,
        username: 'trangn',
        plan: 'Premium',
        joinedAt: '2023-05-05T15:12:00Z',
        lastActive: '2025-02-16T10:05:00Z',
        status: 'active',
    },
    {
        id: 'USR-003',
        name: 'Quang Le',
        email: 'quang.le@example.com',
        phone: '0901 111 222',
        gender: 'Male',
        role: 'Moderator',
        address: 'Hanoi, Vietnam',
        birthday: new Date('1990-11-03'),
        isActive: false,
        username: 'quangle',
        plan: 'Free',
        joinedAt: '2022-11-22T03:43:00Z',
        lastActive: '2025-01-27T19:45:00Z',
        status: 'inactive',
    },
    {
        id: 'USR-004',
        name: 'Linh Pham',
        email: 'linh.pham@example.com',
        phone: '0912 888 999',
        gender: 'Female',
        role: 'Premium Member',
        address: 'Can Tho, Vietnam',
        birthday: new Date('1997-02-10'),
        isActive: true,
        username: 'linhpham',
        plan: 'Premium',
        joinedAt: '2024-01-14T07:30:00Z',
        lastActive: '2025-02-18T06:15:00Z',
        status: 'active',
    },
    {
        id: 'USR-005',
        name: 'Huy Tran',
        email: 'huy.tran@example.com',
        phone: '0934 777 456',
        gender: 'Male',
        role: 'Member',
        address: 'Hue, Vietnam',
        birthday: new Date('1998-06-18'),
        isActive: true,
        username: 'huytran',
        plan: 'Free',
        joinedAt: '2024-05-09T11:10:00Z',
        lastActive: '2025-02-14T17:20:00Z',
        status: 'flagged',
    },
    {
        id: 'USR-006',
        name: 'My Dinh',
        email: 'my.dinh@example.com',
        phone: '0908 123 456',
        gender: 'Female',
        role: 'Support',
        address: 'Bien Hoa, Vietnam',
        birthday: new Date('1992-12-01'),
        isActive: true,
        username: 'mydinh',
        plan: 'Enterprise',
        joinedAt: '2022-08-01T08:00:00Z',
        lastActive: '2025-02-17T13:00:00Z',
        status: 'active',
    },
];

const totalUsers = adminUsers.length;
const activeUsers = adminUsers.filter((user) => user.status === 'active').length;
const flaggedUsers = adminUsers.filter((user) => user.status === 'flagged')
    .length;
const premiumUsers = adminUsers.filter((user) => user.plan !== 'Free').length;

const formatDate = (value: Date | string) =>
    new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

const statusStyle: Record<
    AdminUserRecord['status'],
    { label: string; variant: string }
> = {
    active: { label: 'Active', variant: 'bg-emerald-100 text-emerald-800' },
    inactive: { label: 'Inactive', variant: 'bg-slate-100 text-slate-800' },
    flagged: { label: 'Flagged', variant: 'bg-amber-100 text-amber-800' },
};

export default function AdminUsersPage() {
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>All registered members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {totalUsers.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Sync with account service when API is ready.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Active Accounts</CardTitle>
                        <CardDescription>
                            Users active in the last week
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {activeUsers.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Based on mock data for now.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Premium / Enterprise</CardTitle>
                        <CardDescription>
                            Subscribers and enterprise seats
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {premiumUsers.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Upgrade counts will update with API.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Flagged Accounts</CardTitle>
                        <CardDescription>
                            Accounts pending review or moderation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-semibold">
                            {flaggedUsers.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            Review queue placeholder.
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
                                    <TableHead className="min-w-[110px]">
                                        Username
                                    </TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead className="min-w-[180px]">
                                        Address
                                    </TableHead>
                                    <TableHead>Birthday</TableHead>
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Last Active</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {adminUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                {user.name}
                                            </div>
                                            <div className="text-muted-foreground text-sm">
                                                {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user.plan}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell>{user.gender}</TableCell>
                                        <TableCell>{user.address}</TableCell>
                                        <TableCell>
                                            {formatDate(user.birthday)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.joinedAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={
                                                    statusStyle[user.status]
                                                        .variant
                                                }
                                            >
                                                {statusStyle[user.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(user.lastActive)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Data currently uses curated seed accounts. Once the
                        backend exposes the user directory endpoint, wire this
                        table to the API response and enable pagination, search,
                        and moderation actions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
