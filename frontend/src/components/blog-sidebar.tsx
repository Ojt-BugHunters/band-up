'use client';

import { Bookmark, Heart, Home, Tag } from 'lucide-react';
import { Button } from './ui/button';

const blogSidebarItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Tag, label: 'Tags' },
    { icon: Bookmark, label: 'Bookmark List' },
    {
        icon: Heart,
        label: 'Liked Posts',
    },
];

export default function BlogSideBar() {
    return (
        <nav className="sticky top-20 space-y-2">
            {blogSidebarItems.map((item) => (
                <Button
                    key={item.label}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className="hover:bg-accent h-11 w-full justify-start gap-3 transition-all duration-200"
                >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                </Button>
            ))}
        </nav>
    );
}
