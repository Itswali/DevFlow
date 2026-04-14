'use client';

import { useState, useTransition } from 'react';
import { Task }                    from './KanbanBoard';
import { getCommentsByTask }       from '@/lib/actions/comment.actions';
import CommentSection              from './CommentSection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge }   from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Loader2 } from 'lucide-react';

const priorityStyles = {
  low:    'bg-slate-100  text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100    text-red-600',
};

interface Props {
  task:          Task;
  projectId:     string;
  currentUserId: string;
  open:          boolean;
  onClose:       () => void;
}

export default function TaskDetailModal({
  task,
  projectId,
  currentUserId,
  open,
  onClose,
}: Props) {
  const [comments, setComments]     = useState<any[]>([]);
  const [loaded,   setLoaded]       = useState(false);
  const [isPending, startTransition] = useTransition();

  // Fetch comments when modal opens (lazy — only when needed)
  function handleOpen(isOpen: boolean) {
    if (isOpen && !loaded) {
      startTransition(async () => {
        const data = await getCommentsByTask(task._id);
        setComments(data);
        setLoaded(true);
      });
    }
    if (!isOpen) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle className="text-lg leading-snug pr-6">
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
              {task.priority} priority
            </span>
            <Badge variant="secondary" className="text-xs capitalize">
              {task.status.replace('-', ' ')}
            </Badge>
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                Due {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </div>
            )}
          </div>

          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Assigned to</span>
              <Avatar className="w-5 h-5">
                <AvatarImage src={task.assignee.image} />
                <AvatarFallback className="text-[10px]">
                  {task.assignee.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{task.assignee.name}</span>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Comments */}
          <div>
            <p className="text-xs text-muted-foreground font-medium mb-3">
              Comments
            </p>
            {isPending ? (
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
