'use client';

import { useState }    from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS }         from '@dnd-kit/utilities';
import { Task }        from './KanbanBoard';
import TaskDetailModal from './TaskDetailModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  task:           Task;
  projectId?:     string;
  currentUserId?: string;
  members?:       { _id: string; name: string; image?: string }[];
  overlay?:       boolean;
}

const PRIORITY_DOT: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-blue-400',
  low:      'bg-gray-300',
};

const TAG_COLORS: Record<string, string> = {
  frontend:    'bg-blue-50 text-blue-600',
  backend:     'bg-purple-50 text-purple-600',
  database:    'bg-green-50 text-green-700',
  testing:     'bg-yellow-50 text-yellow-700',
  'real-time': 'bg-red-50 text-red-600',
  ui:          'bg-pink-50 text-pink-600',
  ux:          'bg-pink-50 text-pink-600',
  auth:        'bg-indigo-50 text-indigo-600',
  security:    'bg-indigo-50 text-indigo-600',
  'next.js':   'bg-gray-100 text-gray-700',
  state:       'bg-orange-50 text-orange-600',
  qa:          'bg-lime-50 text-lime-700',
  responsive:  'bg-cyan-50 text-cyan-700',
  performance: 'bg-amber-50 text-amber-700',
};

function tagColor(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? 'bg-gray-100 text-gray-600';
}

export default function TaskCard({ task, projectId, currentUserId, members, overlay }: Props) {
  const [open, setOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const card = (
    <div
      className={`bg-white rounded-xl border border-gray-100 p-3.5 shadow-sm cursor-pointer select-none hover:shadow-md hover:border-gray-200 transition-all duration-150 ${isDragging || overlay ? 'opacity-50 rotate-1 shadow-xl' : ''}`}
      onClick={() => !overlay && setOpen(true)}
    >
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.tags.map((tag) => (
            <span key={tag} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${tagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-sm font-semibold text-gray-900 leading-snug">{task.title}</p>

      {task.description && (
        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2 mt-1">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <Avatar className="w-5 h-5">
              <AvatarImage src={task.assignee.image} />
              <AvatarFallback className="text-[8px] bg-gray-200 text-gray-600">
                {task.assignee.name[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-5 h-5 rounded-full bg-gray-50 border border-dashed border-gray-300" />
          )}
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOT[task.priority] ?? 'bg-gray-300'}`} />
        </div>

        <div className="flex items-center gap-2.5 text-gray-400">
          {(task.commentCount ?? 0) > 0 && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <MessageSquare className="w-3 h-3" />{task.commentCount}
            </span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-0.5 text-[11px]">
              <Calendar className="w-3 h-3" />{format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (overlay) return card;

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>{card}</div>
      {open && projectId && currentUserId && members && (
        <TaskDetailModal task={task} projectId={projectId} currentUserId={currentUserId} members={members} open={open} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
