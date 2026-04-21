'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove }              from '@dnd-kit/sortable';
import KanbanColumn               from './KanbanColumn';
import KanbanFilters              from './KanbanFilters';
import TaskCard                   from './TaskCard';
import { updateTaskStatus }       from '@/lib/actions/task.actions';
import { useAppSelector }         from '@/store/hooks';
import { toast }                  from 'sonner';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Task {
  _id:          string;
  title:        string;
  description?: string;
  status:       TaskStatus;
  priority:     'low' | 'medium' | 'high';
  order:        number;
  assignee?:    { _id: string; name: string; image?: string };
  dueDate?:     string;
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo',        label: '📋 To Do'      },
  { id: 'in-progress', label: '🔄 In Progress' },
  { id: 'in-review',   label: '👀 In Review'   },
  { id: 'done',        label: '✅ Done'        },
];

interface Props {
  projectId:     string;
  initialTasks:  Task[];
  currentUserId: string;
  members:       { _id: string; name: string; image?: string }[];
}

export default function KanbanBoard({
  projectId,
  initialTasks,
  members,
  currentUserId,
}: Props) {
  const [tasks, setTasks]           = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Read filters from Redux
  const filterPriority = useAppSelector((s) => s.ui.filterPriority);
  const filterAssignee = useAppSelector((s) => s.ui.filterAssigneeId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // useMemo — filtered + sorted tasks only recompute when dependencies change
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const priorityMatch =
        filterPriority === 'all' || task.priority === filterPriority;

      const assigneeMatch =
        filterAssignee === null || task.assignee?._id === filterAssignee;

      return priorityMatch && assigneeMatch;
    });
  }, [tasks, filterPriority, filterAssignee]);

  // Get tasks for a column — uses filteredTasks, not raw tasks
  function getColumnTasks(status: TaskStatus) {
    return filteredTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  }

  function onDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId     = active.id as string;
    const overId       = over.id   as string;
    if (activeId === overId) return;

    const dragged      = tasks.find((t) => t._id === activeId);
    const overTask     = tasks.find((t) => t._id === overId);
    const overIsColumn = COLUMNS.some((col) => col.id === overId);

    if (!dragged) return;

    if (overIsColumn && dragged.status !== overId) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeId ? { ...t, status: overId as TaskStatus } : t
        )
      );
      return;
    }

    if (overTask && dragged.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeId ? { ...t, status: overTask.status } : t
        )
      );
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId     = active.id as string;
    const overId       = over.id   as string;
    const dragged      = tasks.find((t) => t._id === activeId);
    if (!dragged) return;

    const overIsColumn = COLUMNS.some((col) => col.id === overId);
    const newStatus    = overIsColumn
      ? (overId as TaskStatus)
      : (tasks.find((t) => t._id === overId)?.status ?? dragged.status);

    const columnTasks = getColumnTasks(newStatus);
    const oldIndex    = columnTasks.findIndex((t) => t._id === activeId);
    const newIndex    = overIsColumn
      ? columnTasks.length
      : columnTasks.findIndex((t) => t._id === overId);

    const reordered = arrayMove(
      columnTasks,
      oldIndex === -1 ? columnTasks.length - 1 : oldIndex,
      newIndex  === -1 ? columnTasks.length - 1 : newIndex
    );

    const updatedTasks = tasks.map((t) => {
      const match = reordered.find((r) => r._id === t._id);
      if (match) {
        return { ...t, status: newStatus, order: reordered.indexOf(match) };
      }
      return t;
    });

    setTasks(updatedTasks);

    try {
      const newOrder = reordered.findIndex((t) => t._id === activeId);
      await updateTaskStatus(activeId, newStatus, newOrder);
    } catch {
      toast.error('Failed to save task position');
      setTasks(initialTasks);
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Filter Bar */}
      <KanbanFilters members={members} />

      {/* Board */}
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 p-6 flex-1 overflow-x-auto">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              tasks={getColumnTasks(col.id)}
              projectId={projectId}
              members={members}
              currentUserId={currentUserId}
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
