'use client';
import { useState }    from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { Task }        from './KanbanBoard';
import { Card }        from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Trash2 } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import { deleteTask }  from '@/lib/actions/task.actions';
import { toast }       from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const priorityStyles = {
  low:    'bg-slate-100  text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100    text-red-600',
};

interface Props {
  task:           Task;
  projectId?:     string;
  currentUserId?: string;
  overlay?:       boolean;
}

export default function TaskCard({ task, projectId, currentUserId, overlay }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task._id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!projectId) return;
    setDeleting(true);
    try {
      await deleteTask(task._id, projectId);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
      setDeleting(false);
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        onClick={() => !isDragging && !overlay && setModalOpen(true)}
        className={`relative p-3 cursor-pointer space-y-2 group ${
          overlay ? 'shadow-xl rotate-1' : 'hover:shadow-sm'
        }`}
      >
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 cursor-grab active:cursor-grabbing -mx-1 px-1 rounded"
        >
          <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>

          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                })}
              </div>
            )}
            {task.assignee && (
              <Avatar className="w-5 h-5">
                <AvatarImage src={task.assignee.image} />
                <AvatarFallback className="text-[10px]">
                  {task.assignee.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Delete button — visible on hover, only for project members */}
        {projectId && !overlay && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                disabled={deleting}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>
                  &quot;{task.title}&quot; and all its comments will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </Card>

      {projectId && currentUserId && !overlay && (
        <TaskDetailModal
          task={task}
          projectId={projectId}
          currentUserId={currentUserId}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
