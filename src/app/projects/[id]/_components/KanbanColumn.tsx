'use client';

import { useState, useTransition } from 'react';
import TaskCard                    from './TaskCard';
import { Task, TaskStatus }        from './KanbanBoard';
import { createTask }              from '@/lib/actions/task.actions';
import { Button }                  from '@/components/ui/button';
import { Input }                   from '@/components/ui/input';
import { Plus, X, Loader2 }        from 'lucide-react';
import { toast }                   from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  column:    { id: TaskStatus; label: string };
  tasks:     Task[];
  projectId: string;
  members:   { _id: string; name: string; image?: string }[];
}

export default function KanbanColumn({
  column,
  tasks,
  projectId,
  // selectedTaskId,
  // onTaskClick,
}: Props) {
  const [adding, setAdding]          = useState(false);
  const [title, setTitle]            = useState('');
  const [priority, setPriority] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

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
      <div className="flex flex-col gap-2 flex-1 rounded-lg p-2 min-h-50 bg-muted/20">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            // isSelected={task._id === selectedTaskId}
            // onClick={() => onTaskClick(task)}
          />
        ))}

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
            <Textarea
              autoFocus
              placeholder="Task Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter')  handleAdd();
                if (e.key === 'Escape') setAdding(false);
              }}
            />
             <Select>
      <SelectTrigger className="w-full max-w-48" value={priority} onChange={(e) => setPriority(e.target.value)}>
        <SelectValue placeholder="Select Task Priority" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Priority</SelectLabel>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="hard">Hard</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
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
