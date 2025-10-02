import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Eye, FileText, Mail, Phone, User } from 'lucide-react';
import { user } from '../../../constants/sample-data';
import { useMemo } from 'react';

const bgGradients = [
    'from-blue-50 to-indigo-50',
    'from-pink-50 to-rose-100',
    'from-emerald-50 to-green-100',
    'from-yellow-50 to-amber-100',
    'from-sky-50 to-cyan-100',
    'from-purple-50 to-fuchsia-100',
];

const quotes = [
    '"Practice makes perfect!"',
    '"Step by step to 9.0 IELTS!"',
    '"Small progress is still progress."',
    '"Consistency beats talent."',
    '"Your effort will pay off."',
    '"Believe in your journey!"',
    '"Stay focused, stay strong."',
    '"One more test, one step closer."',
];

export default function ViewProfilePage() {
    const bgClass = useMemo(
        () => bgGradients[Math.floor(Math.random() * bgGradients.length)],
        [],
    );

    const quote = useMemo(
        () => quotes[Math.floor(Math.random() * quotes.length)],
        [],
    );

    return (
        <div className="mx-auto flex-1 space-y-6 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="relative mt-16">
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div
                            className={`bg-gradient-to-r ${bgClass} px-6 py-8 text-center`}
                        >
                            <p className="text-xl font-semibold text-zinc-700 italic md:text-xl">
                                {quote}
                            </p>
                        </div>

                        <div className="relative -mt-10 ml-6 flex flex-col items-start px-6 pb-8">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-20 rounded-lg border-4 border-white shadow-md">
                                    <AvatarImage src="/test.png" />
                                </Avatar>
                                <Badge
                                    variant="outline"
                                    className={
                                        user?.role === 'Premium Member'
                                            ? 'aura-premium'
                                            : 'bg-rose-500 text-white'
                                    }
                                >
                                    {user?.role}
                                </Badge>
                            </div>
                            <h1 className="mt-4 text-2xl font-bold text-zinc-900">
                                {user?.name}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-7xl py-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-zinc-500" />
                                    <div>
                                        <p className="text-sm text-zinc-500">
                                            Email
                                        </p>
                                        <p className="font-medium">
                                            {user?.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-zinc-500" />
                                    <div>
                                        <p className="text-sm text-zinc-500">
                                            Phone number:
                                        </p>
                                        <p className="font-medium">
                                            {' '}
                                            {user?.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-zinc-500" />
                                    <div>
                                        <p className="text-sm text-zinc-500">
                                            Sex
                                        </p>
                                        <p className="font-medium">
                                            {user?.gender}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <CalendarDays className="h-5 w-5 text-zinc-500" />
                                    <div>
                                        <p className="text-sm text-zinc-500">
                                            BirthDay:
                                        </p>
                                        <p className="font-medium">
                                            {user?.birthday
                                                ? user.birthday.toLocaleDateString()
                                                : ''}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">
                                    Blog
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="rounded-lg border p-4 transition-colors hover:bg-zinc-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-zinc-900">
                                                        How to reaching 9.0
                                                        IELTS ?
                                                    </h3>
                                                    <p className="mt-1 text-sm text-zinc-600">
                                                        The sharing of roadmap
                                                        to reach master IELTS
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
                                                        <span>
                                                            Uploaded on Dec 10,
                                                            2023
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="bg-white text-zinc-600"
                                                >
                                                    <Eye className="mr-1 h-4 w-4" />
                                                    Read
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
