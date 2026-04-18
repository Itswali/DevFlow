'use client';

import { useState }    from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { Task }        from './KanbanBoard';
import { Card }        from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays }  from 'lucide-react';
import TaskDetailModal   from './TaskDetailModal';

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

export default function TaskCard({
  task,
  projectId,
  currentUserId,
  overlay,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
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
      onClick={() => !isDragging && !overlay && setModalOpen(true)}
      className={`p-3 cursor-pointer space-y-2 ${
        overlay ? 'shadow-xl rotate-1' : 'hover:shadow-sm'
      }`}
    >
      {/* Drag handle — only this area is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-1 cursor-grab active:cursor-grabbing -mx-1 px-1 rounded"
      >
        <p className="text-sm font-medium leading-snug flex-1">{task.title}</p>
      </div>

      {/* Rest of card — not draggable, click opens modal */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}
        {/* Footer */}
        <div className="flex items-center justify-between pt-1">

          {/* Priority Badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityStyles[task.priority]}`}>
            {task.priority}
          </span>

          <div className="flex items-center gap-2">
            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day:   'numeric',
                })}
              </div>
            )}

            {/* Assignee Avatar */}
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

      {/* Modal — skip in DragOverlay */}
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
