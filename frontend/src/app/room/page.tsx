'use client';
import { Room } from '@/lib/api/dto/room';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CreateRoomDialog } from './create-room-dialog';
import { useGetPublicRooms } from '@/lib/service/room';
import { JoinRoomDialog } from './join-room-dialog';
import { JoinRoomByCodeDialog } from './join-room-by-code';

export default function RoomsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [joinCodeDialogOpen, setJoinCodeDialogOpen] = useState(false);
    const [confirmJoinDialogOpen, setConfirmJoinDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const { data: roomList } = useGetPublicRooms();

    const roomsPerPage = 10;

    const filteredRooms = useMemo(() => {
        if (!roomList) return [];
        return roomList.filter((room) =>
            room.roomName.toLowerCase().includes(searchQuery.toLowerCase()),
        );
    }, [roomList, searchQuery]);

    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage) || 1;
    const startIndex = (currentPage - 1) * roomsPerPage;
    const endIndex = startIndex + roomsPerPage;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roomList]);

    const handleJoinClick = (room: Room) => {
        setSelectedRoom(room);
        setConfirmJoinDialogOpen(true);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(/room-bg-1.jpg)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-blue-500/10 to-slate-900/60" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative border-b border-white/10 shadow-2xl shadow-black/30"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/60 via-zinc-900/50 to-zinc-900/60 backdrop-blur-md" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

                    <div className="relative px-8 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                                    Study Rooms
                                </h1>
                                <p className="mt-0.5 text-xs font-medium text-white/80 drop-shadow">
                                    Join a room and start your focused learning
                                    session
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <JoinRoomByCodeDialog
                                    joinCodeDialogOpen={joinCodeDialogOpen}
                                    setJoinCodeDialogOpen={
                                        setJoinCodeDialogOpen
                                    }
                                />
                                <CreateRoomDialog
                                    createDialogOpen={createDialogOpen}
                                    setCreateDialogOpen={setCreateDialogOpen}
                                />
                            </div>
                        </div>
                    </div>
                </motion.header>

                <div className="flex-1 overflow-auto px-6 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-full"
                    >
                        <div className="mb-6">
                            <div className="relative max-w-md">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/70" />
                                <Input
                                    type="text"
                                    placeholder="Search rooms..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="h-10 rounded-xl border-white/20 bg-zinc-900/60 pl-10 text-sm font-medium text-white shadow-lg shadow-black/20 backdrop-blur-md placeholder:text-white/60 focus-visible:ring-white/30"
                                />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-zinc-700/50 bg-zinc-900/70 shadow-2xl shadow-black/40 backdrop-blur-md">
                            <div className="scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent max-h-[calc(100vh-280px)] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="border-b border-zinc-700/50 bg-zinc-900/90 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-white/90">
                                                #
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-white/90">
                                                Room Name
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-bold text-white/90">
                                                Description
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-white/90">
                                                Code
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-white/90">
                                                <Users className="inline h-4 w-4" />
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-bold text-white/90">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRooms.map((room, index) => (
                                            <motion.tr
                                                key={room.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.05,
                                                }}
                                                className="group border-b border-zinc-800/50 transition-all duration-300 hover:bg-white/5"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-white/70">
                                                        {startIndex + index + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-base font-bold text-white">
                                                        {room.roomName}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-white/70">
                                                        {room.description}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block rounded-full border border-zinc-700/50 bg-zinc-800/80 px-3 py-1 font-mono text-xs text-white backdrop-blur-md">
                                                        {room.roomCode}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-bold text-white">
                                                        {room.numberOfMembers}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button
                                                        size="sm"
                                                        onClick={() =>
                                                            handleJoinClick(
                                                                room,
                                                            )
                                                        }
                                                        className="border border-zinc-700/50 bg-zinc-800/80 text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                                                    >
                                                        Join
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredRooms.length > 0 && (
                                <div className="flex items-center justify-between border-t border-zinc-700/50 bg-zinc-900/80 px-6 py-4 backdrop-blur-md">
                                    <div className="text-sm text-white/70">
                                        Showing {startIndex + 1} to{' '}
                                        {Math.min(
                                            endIndex,
                                            filteredRooms.length,
                                        )}{' '}
                                        of {filteredRooms.length} rooms
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(1, prev - 1),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="border-zinc-700/50 bg-zinc-800/80 text-white backdrop-blur-md hover:bg-zinc-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from(
                                                { length: totalPages },
                                                (_, i) => i + 1,
                                            ).map((page) => (
                                                <Button
                                                    key={page}
                                                    size="sm"
                                                    variant={
                                                        currentPage === page
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(page)
                                                    }
                                                    className={
                                                        currentPage === page
                                                            ? 'bg-rose-400 text-white shadow-lg shadow-rose-400/50 hover:bg-rose-500'
                                                            : 'border-zinc-700/50 bg-zinc-800/80 text-white backdrop-blur-md hover:bg-zinc-700/80'
                                                    }
                                                >
                                                    {page}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        totalPages,
                                                        prev + 1,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="border-zinc-700/50 bg-zinc-800/80 text-white backdrop-blur-md hover:bg-zinc-700/80 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {filteredRooms.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-16 text-center"
                            >
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/80 shadow-xl shadow-black/30 backdrop-blur-md">
                                    <Search className="h-12 w-12 text-white/70" />
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-white drop-shadow-lg">
                                    No rooms found
                                </h3>
                                <p className="mb-6 text-white/70 drop-shadow">
                                    Try adjusting your search or create a new
                                    room
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>
            <JoinRoomDialog
                confirmJoinDialogOpen={confirmJoinDialogOpen}
                setConfirmJoinDialogOpen={setConfirmJoinDialogOpen}
                selectedRoom={selectedRoom}
            />
        </div>
    );
}
