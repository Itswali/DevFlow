'use client';

import { useState, useTransition } from 'react';
import { useDroppable }            from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard      from './TaskCard';
import { Task, TaskStatus } from './KanbanBoard';
import { createTask }       from '@/lib/actions/task.actions';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button }   from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, X, Loader2, Calendar, User, Flag, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  column:        { id: TaskStatus; label: string; color: string };
  tasks:         Task[];
  projectId:     string;
  currentUserId: string;
  members:       { _id: string; name: string; image?: string }[];
}

export default function KanbanColumn({ column, tasks, projectId, members = [], currentUserId }: Props) {
  const [adding, setAdding]          = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title,       setTitle]      = useState('');
  const [description, setDesc]       = useState('');
  const [priority,    setPriority]   = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [assigneeId,  setAssignee]   = useState('');
  const [dueDate,     setDueDate]    = useState('');
  const [tagsInput,   setTagsInput]  = useState('');

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  function resetForm() {
    setTitle(''); setDesc(''); setPriority('medium');
    setAssignee(''); setDueDate(''); setTagsInput('');
    setAdding(false);
  }

  function handleAdd() {
    if (!title.trim()) return toast.error('Title is required');
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    startTransition(async () => {
      try {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          projectId,
          status: column.id,
          priority,
          assigneeId: assigneeId || undefined,
          dueDate:    dueDate    || undefined,
          tags,
        });
        toast.success('Task created!');
        resetForm();
      } catch {
        toast.error('Failed to create task');
      }
    });
  }

  return (
    <div className="flex flex-col w-[272px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${column.color}`} />
          <span className="font-semibold text-sm text-gray-700">{column.label}</span>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2.5 flex-1 rounded-xl p-2 min-h-[500px] transition-all ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-dashed' : 'bg-gray-100/60'
        }`}
      >
        <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
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

        {/* Add form */}
        {adding ? (
          <div className="flex flex-col gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-150">
            <Input
              autoFocus
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') resetForm(); }}
              className="text-sm font-medium border-none px-0 shadow-none focus-visible:ring-0"
            />
            <Textarea
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              className="text-xs resize-none border-none px-0 shadow-none focus-visible:ring-0 min-h-[44px]"
            />
            <div className="flex gap-2">
              <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                <SelectTrigger className="h-7 text-[10px] flex-1 gap-1">
                  <Flag className="w-3 h-3 shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={assigneeId} onValueChange={setAssignee}>
                <SelectTrigger className="h-7 text-[10px] flex-1 gap-1">
                  <User className="w-3 h-3 shrink-0" />
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m._id} value={m._id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Tag className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
              <Input
                placeholder="Tags: backend, ui..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="h-7 text-[10px] pl-6"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-7 text-[10px] pl-6"
              />
            </div>
            <div className="flex justify-end gap-1.5 pt-1 border-t border-gray-100">
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={resetForm}>
                <X className="w-3 h-3 mr-1" />Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs px-3" onClick={handleAdd} disabled={isPending || !title.trim()}>
                {isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}Create
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-2 rounded-lg hover:bg-white/80 transition-colors w-full"
          >
            <Plus className="w-3.5 h-3.5" /> Add a task
          </button>
        )}
      </div>
    </div>
  );
}
