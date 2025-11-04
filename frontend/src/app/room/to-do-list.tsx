import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { GripVertical, ListTodo, X } from 'lucide-react';
import { Task } from '@/lib/api/dto/room';

interface ToDoListBoxProps {
    taskList: Task[];
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
                        className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                    >
                        <ListTodo className="h-5 w-5 text-white" />
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    side="top"
                    align="start"
                    className="w-96 border-zinc-700/50 bg-zinc-900/95 p-0 shadow-2xl shadow-black/40 backdrop-blur-xl"
                >
                    <div className="p-4">
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            Session Tasks
                        </h2>

                        {taskList.length === 0 ? (
                            <div className="py-8 text-center">
                                <ListTodo className="mx-auto mb-3 h-12 w-12 text-white/50" />
                                <p className="text-sm text-white/70">
                                    No tasks yet. Type a task and press Enter to
                                    add it.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {taskList.map(
                                    (taskItem: Task, index: number) => (
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
                                            className={`flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md transition-all hover:bg-zinc-700/60 hover:shadow-lg ${
                                                draggedIndex === index
                                                    ? 'opacity-50'
                                                    : ''
                                            }`}
                                        >
                                            <GripVertical className="h-4 w-4 cursor-grab text-white/50 active:cursor-grabbing" />
                                            <Checkbox
                                                checked={taskItem.completed}
                                                onCheckedChange={() =>
                                                    toggleTaskCompletion(
                                                        taskItem.id,
                                                    )
                                                }
                                                className="border-zinc-600/50 data-[state=checked]:bg-white data-[state=checked]:text-black"
                                            />
                                            <span
                                                className={`flex-1 text-sm text-white ${
                                                    taskItem.completed
                                                        ? 'line-through opacity-60'
                                                        : ''
                                                }`}
                                            >
                                                {taskItem.text}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    removeTask(taskItem.id)
                                                }
                                                className="rounded p-1 transition-colors hover:bg-zinc-700/50"
                                            >
                                                <X className="h-4 w-4 text-white/70" />
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        );
    },
);

ToDoListBox.displayName = 'ToDoListBox';
