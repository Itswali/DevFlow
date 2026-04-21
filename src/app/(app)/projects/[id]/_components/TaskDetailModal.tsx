'use client';

import { useState, useTransition }  from 'react';
import { Task }                     from './KanbanBoard';
import { getCommentsByTask }        from '@/lib/actions/comment.actions';
import { updateTask }               from '@/lib/actions/task.actions';
import CommentSection               from './CommentSection';
import {
  Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input }     from '@/components/ui/input';
import { Textarea }  from '@/components/ui/textarea';
import { Badge }     from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select, SelectContent,
  SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Pencil, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  _id:    string;
  name:   string;
  image?: string;
}

interface Props {
  task:          Task;
  projectId:     string;
  currentUserId: string;
  members:       Member[];
  open:          boolean;
  onClose:       () => void;
}


export default function TaskDetailModal({
  task,
  projectId,
  currentUserId,
  members,
  open,
  onClose,
}: Props) {
  const [comments, setComments]      = useState<any[]>([]);
  const [isPending,        startTransition]        = useTransition(); // for edits
  const [isLoadingComments, startCommentTransition] = useTransition();

  // Edit state
  const [editingTitle, setEditingTitle]   = useState(false);
  const [title,        setTitle]          = useState(task.title);
  const [description,  setDescription]    = useState(task.description ?? '');
  const [priority,     setPriority]       = useState(task.priority);
  const [assigneeId,   setAssigneeId]     = useState(task.assignee?._id ?? 'unassigned');
  const [dueDate,      setDueDate]        = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  function handleOpen(isOpen: boolean) {
  if (isOpen) {
    setComments([]);
    startCommentTransition(async () => {  // 👈 use comment transition
      const data = await getCommentsByTask(task._id);
      setComments(data);
    });
  }
  if (!isOpen) {
    onClose();
    setComments([]);
  }
}

  function handleSaveTitle() {
    if (!title.trim()) return toast.error('Title cannot be empty');
    startTransition(async () => {
      try {
        await updateTask(task._id, { title: title.trim() });
        setEditingTitle(false);
        toast.success('Title updated');
      } catch {
        toast.error('Failed to update title');
      }
    });
  }

  function handleUpdateField(field: string, value: string) {
    startTransition(async () => {
      try {
        await updateTask(task._id, {
          [field]: value === 'unassigned' ? undefined : value,
        });
        toast.success('Task updated');
      } catch {
        toast.error('Failed to update task');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">

        <DialogHeader>

          {/* Editable Title */}
          {editingTitle ? (
            <div className="flex items-center gap-2 pr-6">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter')  handleSaveTitle();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                className="text-base font-semibold"
              />
              <button onClick={handleSaveTitle} className="text-green-600 hover:text-green-700">
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" />
                }
              </button>
              <button onClick={() => setEditingTitle(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group pr-6">
              <DialogTitle className="text-lg leading-snug">
                {title}
              </DialogTitle>
              <button
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <DialogDescription className="sr-only">
            Task details and comments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">

          {/* Editable Fields Row */}
          <div className="grid grid-cols-2 gap-3">

            {/* Priority */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Priority</p>
              <Select
                value={priority}
                onValueChange={(val: any) => {
                  setPriority(val);
                  handleUpdateField('priority', val);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Assignee</p>
              <Select
                value={assigneeId}
                onValueChange={(val) => {
                  setAssigneeId(val);
                  handleUpdateField('assigneeId', val);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member._id} value={member._id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={member.image} />
                          <AvatarFallback className="text-[9px]">
                            {member.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Due Date</p>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleUpdateField('dueDate', e.target.value);
                }}
                className="h-8 text-xs"
              />
            </div>

            {/* Status badge */}
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Status</p>
              <div className="h-8 flex items-center">
                <Badge variant="secondary" className="text-xs capitalize">
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>

          </div>

          {/* Description */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Description</p>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleUpdateField('description', description)}
              rows={3}
              className="resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Click away to save
            </p>
          </div>

          {/* Comments */}
         <div>
  <p className="text-xs text-muted-foreground font-medium mb-3">
    Comments
  </p>
  {isLoadingComments ? (   // 👈 use isLoadingComments, not isPending
    <div className="flex justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  ) : (
    <CommentSection
      taskId={task._id}
      projectId={projectId}
      initialComments={comments}
      currentUserId={currentUserId}
    />
  )}
</div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
