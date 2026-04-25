'use client';

import { useState, useTransition } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';
import { Task, TaskStatus } from './KanbanBoard';
import { createTask } from '@/lib/actions/task.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Loader2, Calendar, User, Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  column: { id: TaskStatus; label: string };
  tasks: Task[];
  projectId: string;
  currentUserId: string;
  members: { _id: string; name: string; image?: string }[];
}

export default function KanbanColumn({
  column,
  tasks,
  projectId,
  members = [],
  currentUserId,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  // --- Form State ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssigneeId('');
    setDueDate('');
    setAdding(false);
  };

  function handleAdd() {
    if (!title.trim()) return toast.error('Title is required');

    startTransition(async () => {
      try {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          projectId,
          status: column.id, // Ensure it lands in the correct column
          priority,
          assigneeId: assigneeId || undefined,
          dueDate: dueDate || undefined,
        });
        toast.success('Task created!');
        resetForm();
      } catch {
        toast.error('Failed to create task');
      }
    });
  }

  return (
    <div className="flex flex-col w-80 shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{column.label}</span>
          <span className="bg-muted text-muted-foreground text-[10px] font-bold rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="w-7 h-7 hover:bg-primary/10 hover:text-primary"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-3 flex-1 rounded-xl p-2 min-h-[500px] transition-colors border-2 border-transparent ${
          isOver ? 'bg-secondary/50 border-dashed border-primary/20' : 'bg-muted/30'
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

        {/* Expanded Add Task Form */}
        {adding ? (
          <div className="flex flex-col gap-3 p-3 bg-background rounded-lg border shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <Input
              autoFocus
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-medium border-none px-0 focus-visible:ring-0 text-sm"
            />

            <Textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs resize-none border-none px-0 focus-visible:ring-0 min-h-[60px]"
            />

            <div className="grid grid-cols-1 gap-2">
              {/* Priority & Assignee Row */}
              <div className="flex gap-2">
                <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                  <SelectTrigger className="h-7 text-[10px] w-full">
                    <Flag className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger className="h-7 text-[10px] w-full">
                    <User className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="relative">
                <Calendar className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-7 text-[10px] pl-7"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs px-4"
                onClick={handleAdd}
                disabled={isPending || !title.trim()}
              >
                {isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                Create Task
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="justify-start text-muted-foreground text-xs h-9 hover:bg-background/50"
            onClick={() => setAdding(true)}
          >
            <Plus className="w-3 h-3 mr-2" />
            Add a task
          </Button>
        )}
      </div>
    </div>
  );
}
