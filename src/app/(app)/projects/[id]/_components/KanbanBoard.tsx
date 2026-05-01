'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay,
  DragStartEvent, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove }        from '@dnd-kit/sortable';
import KanbanColumn         from './KanbanColumn';
import TaskCard             from './TaskCard';
import { updateTaskStatus } from '@/lib/actions/task.actions';
import { toast }            from 'sonner';
import { Search }           from 'lucide-react';

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Task {
  _id:           string;
  title:         string;
  description?:  string;
  status:        TaskStatus;
  priority:      'low' | 'medium' | 'high' | 'critical';
  tags:          string[];
  order:         number;
  assignee?:     { _id: string; name: string; image?: string };
  dueDate?:      string;
  commentCount?: number;
}

export const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'backlog',     label: 'Backlog',     color: 'bg-gray-400'   },
  { id: 'todo',        label: 'To Do',       color: 'bg-blue-500'   },
  { id: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { id: 'in-review',   label: 'In Review',   color: 'bg-purple-500' },
  { id: 'done',        label: 'Done',        color: 'bg-green-500'  },
];

type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

interface Props {
  projectId:     string;
  projectName:   string;
  initialTasks:  Task[];
  currentUserId: string;
  members:       { _id: string; name: string; image?: string }[];
}

export default function KanbanBoard({ projectId, projectName, initialTasks, members, currentUserId }: Props) {
  const [tasks, setTasks]           = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch]         = useState('');
  const [priority, setPriority]     = useState<PriorityFilter>('all');

  useEffect(() => { setTasks(initialTasks); }, [initialTasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // ── Optimistic delete ─────────────────────────────────────
  function handleTaskDeleted(taskId: string) {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  }

  const filteredTasks = useMemo(() => tasks.filter((t) => {
    const matchesPriority = priority === 'all' || t.priority === priority;
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q);
    return matchesPriority && matchesSearch;
  }), [tasks, priority, search]);

  function getColumnTasks(status: TaskStatus) {
    return filteredTasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order);
  }

  function onDragStart(e: DragStartEvent) {
    const task = tasks.find((t) => t._id === e.active.id);
    if (task) setActiveTask(task);
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = active.id as string;
    const overId   = over.id   as string;
    if (activeId === overId) return;
    const dragged      = tasks.find((t) => t._id === activeId);
    const overTask     = tasks.find((t) => t._id === overId);
    const overIsColumn = COLUMNS.some((c) => c.id === overId);
    if (!dragged) return;
    if (overIsColumn && dragged.status !== overId) {
      setTasks((prev) => prev.map((t) => t._id === activeId ? { ...t, status: overId as TaskStatus } : t));
      return;
    }
    if (overTask && dragged.status !== overTask.status) {
      setTasks((prev) => prev.map((t) => t._id === activeId ? { ...t, status: overTask.status } : t));
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveTask(null);
    if (!over) return;
    const activeId     = active.id as string;
    const overId       = over.id   as string;
    const dragged      = tasks.find((t) => t._id === activeId);
    if (!dragged) return;
    const overIsColumn = COLUMNS.some((c) => c.id === overId);
    const newStatus    = overIsColumn ? (overId as TaskStatus) : (tasks.find((t) => t._id === overId)?.status ?? dragged.status);
    const columnTasks  = getColumnTasks(newStatus);
    const oldIndex     = columnTasks.findIndex((t) => t._id === activeId);
    const newIndex     = overIsColumn ? columnTasks.length : columnTasks.findIndex((t) => t._id === overId);
    const reordered    = arrayMove(columnTasks, oldIndex === -1 ? columnTasks.length - 1 : oldIndex, newIndex === -1 ? columnTasks.length - 1 : newIndex);
    setTasks(tasks.map((t) => {
      const match = reordered.find((r) => r._id === t._id);
      return match ? { ...t, status: newStatus, order: reordered.indexOf(match) } : t;
    }));
    try {
      await updateTaskStatus(activeId, newStatus, reordered.findIndex((t) => t._id === activeId));
    } catch {
      toast.error('Failed to save task position');
      setTasks(initialTasks);
    }
  }

  const PILLS: { value: PriorityFilter; label: string }[] = [
    { value: 'all',      label: 'All'      },
    { value: 'critical', label: 'Critical' },
    { value: 'high',     label: 'High'     },
    { value: 'medium',   label: 'Medium'   },
    { value: 'low',      label: 'Low'      },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8f9fb]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b bg-white shrink-0 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Kanban Board</h2>
          <p className="text-xs text-gray-400 mt-0.5">{projectName} · {tasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-44 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setPriority(pill.value)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                  priority === pill.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex gap-4 p-5 flex-1 overflow-x-auto">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              projectId={projectId}
              members={members}
              currentUserId={currentUserId}
              onTaskDeleted={handleTaskDeleted}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} overlay />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
