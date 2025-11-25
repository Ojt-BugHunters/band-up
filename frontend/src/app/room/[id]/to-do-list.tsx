import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { GripVertical, ListTodo, X } from 'lucide-react';
import { TaskResponse } from '@/lib/service/task';

interface ToDoListBoxProps {
    taskList: TaskResponse[];
    draggedIndex: number | null;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    toggleTaskCompletion: (idx: string) => void;
    removeTask: (idx: string) => void;
}

export const ToDoListBox = forwardRef<HTMLButtonElement, ToDoListBoxProps>(
    (
        {
            taskList,
            draggedIndex,
            handleDragStart,
            handleDragOver,
            handleDragEnd,
            toggleTaskCompletion,
            removeTask,
        },
        ref,
    ) => {
        const taskButtonRef = useRef<HTMLButtonElement>(null);

        useImperativeHandle(
            ref,
            () => taskButtonRef.current as HTMLButtonElement,
            [],
        );

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        ref={taskButtonRef}
                        className="relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
                    >
                        <span
                            aria-hidden
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                            style={{
                                background:
                                    'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                            }}
                        />
                        <span
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                            style={{
                                background:
                                    'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                                maskImage:
                                    'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                            }}
                        />
                        <ListTodo className="relative z-10 h-5 w-5 text-white" />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    side="top"
                    align="start"
                    className="w-96 border-none bg-transparent p-0 shadow-none"
                >
                    {/* Liquid glass card shell */}
                    <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,.55)] ring-1 ring-white/10 backdrop-blur-2xl">
                        {/* glow + angle sheen */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-16 -z-10 opacity-40 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,.15), transparent 60%), radial-gradient(800px 500px at 80% 0%, rgba(255,255,255,.08), transparent 60%)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-50"
                            style={{
                                background:
                                    'linear-gradient(to bottom right, rgba(255,255,255,.35), rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 60%)',
                                maskImage:
                                    'radial-gradient(120% 120% at 0% 0%, black 40%, transparent 60%)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.06] mix-blend-overlay"
                            style={{
                                backgroundImage:
                                    'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27128%27 height=%27128%27 viewBox=%270 0 128 128%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/></filter><rect width=%27128%27 height=%27128%27 filter=%27url(%23n)%27 opacity=%270.5%27/></svg>")',
                            }}
                        />

                        <div className="p-5">
                            <h2 className="mb-4 text-xl font-semibold text-white/95">
                                Session Tasks
                            </h2>

                            {taskList.length === 0 ? (
                                <div className="py-8 text-center">
                                    <ListTodo className="mx-auto mb-3 h-12 w-12 text-white/50" />
                                    <p className="text-sm text-white/70">
                                        No tasks yet. Type a task and press
                                        Enter to add it.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {taskList.map(
                                        (
                                            taskItem: TaskResponse,
                                            index: number,
                                        ) => (
                                            <div
                                                key={taskItem.id}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(index)
                                                }
                                                onDragOver={(e) =>
                                                    handleDragOver(e, index)
                                                }
                                                onDragEnd={handleDragEnd}
                                                className={`group relative flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-3 shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-xl transition-all hover:scale-[1.01] hover:bg-white/12 ${
                                                    draggedIndex === index
                                                        ? 'opacity-50'
                                                        : ''
                                                }`}
                                            >
                                                <GripVertical className="h-4 w-4 cursor-grab text-white/60 active:cursor-grabbing" />
                                                <Checkbox
                                                    checked={taskItem.completed}
                                                    onCheckedChange={() =>
                                                        toggleTaskCompletion(
                                                            taskItem.id,
                                                        )
                                                    }
                                                    className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                                />
                                                <span
                                                    className={`flex-1 text-sm text-white ${
                                                        taskItem.completed
                                                            ? 'line-through opacity-60'
                                                            : ''
                                                    }`}
                                                >
                                                    {taskItem.title}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        removeTask(taskItem.id)
                                                    }
                                                    className="rounded p-1 transition-colors hover:bg-white/10"
                                                >
                                                    <X className="h-4 w-4 text-white/80" />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        );
    },
);

ToDoListBox.displayName = 'ToDoListBox';
