'use client';

import { Task } from './KanbanBoard';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays } from 'lucide-react';

const priorityStyles = {
  low:    'bg-slate-100  text-slate-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100    text-red-600',
};

interface Props {
  task:       Task;
  isSelected?: boolean;
  onClick?:   () => void;
}

export default function TaskCard({ task, isSelected, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      className={`p-3 cursor-pointer space-y-2 transition-all select-none
        ${isSelected
          ? 'ring-2 ring-primary shadow-md'
          : 'hover:shadow-sm hover:ring-1 hover:ring-muted-foreground/20'
        }`}
    >
      {/* Title */}
      <p className="text-sm font-medium leading-snug">{task.title}</p>

      {/* Description preview */}
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
  );
}
