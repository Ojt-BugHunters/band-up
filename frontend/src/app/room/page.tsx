'use client';

import { useGetActiveRoom } from '@/lib/service/room';
import { RoomResumeCard } from './room-resume-card';
import RoomListPage from './room-list-page';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';

export default function RoomsPageWrapper() {
    const { data: activeRoom, isLoading, isError } = useGetActiveRoom();

    if (isLoading)
        return (
            <div className="flex h-screen items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );

    if (isError)
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-screen flex-col items-center justify-center text-white/70"
            >
                <p>Failed to fetch room data.</p>
            </motion.div>
        );

    if (activeRoom) return <RoomResumeCard room={activeRoom} />;

    return <RoomListPage />;
}
