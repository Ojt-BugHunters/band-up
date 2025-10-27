'use client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminDictationPage() {
    return (
        <div>
            <Button className="cursor-pointer rounded-xl bg-rose-500 font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-rose-600">
                <Plus className="mr-2 h-4 w-4" />
                Create New Dictation
            </Button>
        </div>
    );
}
