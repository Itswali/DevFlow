'use client';

import { useState }    from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { Task }        from './KanbanBoard';
import { Card }        from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays } from 'lucide-react';
import TaskDetailModal  from './TaskDetailModal';

const priorityStyles = {
  low:    'bg-slate-100  text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100    text-red-600',
};

interface Props {
  task:          Task;
  projectId?:    string;
  currentUserId?: string;
  overlay?:      boolean;
}

export default function TaskCard({ task, projectId, currentUserId, overlay }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    attributes, listeners,
    setNodeRef, transform,
    transition,  isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setModalOpen(true)}
        className={`p-3 cursor-grab active:cursor-grabbing space-y-2 ${
          overlay ? 'shadow-xl rotate-1' : 'hover:shadow-sm'
        }`}
      >
        <p className="text-sm font-medium leading-snug">{task.title}</p>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

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
      </Card>

      {/* Modal — only render when projectId is available (not in DragOverlay) */}
      {projectId && currentUserId && (
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
