'use client';

import { useState, useTransition } from 'react';
import { useDroppable }            from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard             from './TaskCard';
import { Task, TaskStatus } from './KanbanBoard';
import { createTask }       from '@/lib/actions/task.actions';
import { Button }           from '@/components/ui/button';
import { Input }            from '@/components/ui/input';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast }            from 'sonner';

interface Props {
  column:        { id: TaskStatus; label: string };
  tasks:         Task[];
  projectId:     string;
  currentUserId: string;
  members:       { _id: string; name: string; image?: string }[];
}

export default function KanbanColumn({
  column,
  tasks,
  projectId,
  members = [],
  currentUserId,
}: Props) {
  const [adding, setAdding]          = useState(false);
  const [title, setTitle]            = useState('');
  const [isPending, startTransition] = useTransition();

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function handleAdd() {
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await createTask({
          title:     title.trim(),
          projectId,
          priority:  'medium',
        });
        toast.success('Task created!');
        setTitle('');
        setAdding(false);
      } catch {
        toast.error('Failed to create task');
      }
    });
  }

  return (
    <div className="flex flex-col w-72 shrink-0">

      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{column.label}</span>
          <span className="bg-muted text-muted-foreground text-xs rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 rounded-lg p-2 min-h-[200px] transition-colors ${
          isOver ? 'bg-muted/60' : 'bg-muted/20'
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              projectId={projectId}
              currentUserId={currentUserId}
              members={members}
            />
          ))}
        </SortableContext>

        {/* Inline Add Task */}
        {adding && (
          <div className="space-y-2 p-2 bg-background rounded-md border">
            <Input
              autoFocus
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  handleAdd();
                if (e.key === 'Escape') setAdding(false);
              }}
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleAdd} disabled={isPending}>
                {isPending
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : 'Add'
                }
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setAdding(false); setTitle(''); }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
