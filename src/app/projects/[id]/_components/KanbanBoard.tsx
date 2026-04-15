'use client';

import { useState } from 'react';
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
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import TaskCard    from './TaskCard';
import { updateTaskStatus } from '@/lib/actions/task.actions';
import { toast } from 'sonner';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  order: number;
  assignee?: { _id: string; name: string; image?: string };
  dueDate?: string;
}

export const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo',        label: '📋 To Do'      },
  { id: 'in-progress', label: '🔄 In Progress' },
  { id: 'in-review',   label: '👀 In Review'   },
  { id: 'done',        label: '✅ Done'        },
];

interface Props {
  projectId: string;
  initialTasks: Task[];
  currentUserId: string;
  members: { _id: string; name: string; image?: string }[];
}

export default function KanbanBoard({ projectId, initialTasks, members, currentUserId }: Props) {
  const [tasks, setTasks]           = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // prevent accidental drags
    })
  );

  // Get tasks for a specific column
  function getColumnTasks(status: TaskStatus) {
    return tasks
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

    const activeId = active.id as string;
    const overId   = over.id   as string;
    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    const overTask   = tasks.find((t) => t._id === overId);

    // Dragging over a column (not a task)
    const overIsColumn = COLUMNS.some((col) => col.id === overId);

    if (!activeTask) return;

    // Dropped on a different column directly
    if (overIsColumn && activeTask.status !== overId) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeId
            ? { ...t, status: overId as TaskStatus }
            : t
        )
      );
      return;
    }

    // Dropped on another task in a different column
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeId
            ? { ...t, status: overTask.status }
            : t
        )
      );
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId   = over.id   as string;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    const overIsColumn = COLUMNS.some((col) => col.id === overId);
    const newStatus    = overIsColumn
      ? (overId as TaskStatus)
      : (tasks.find((t) => t._id === overId)?.status ?? activeTask.status);

    // Reorder within column
    const columnTasks  = getColumnTasks(newStatus);
    const oldIndex     = columnTasks.findIndex((t) => t._id === activeId);
    const newIndex     = overIsColumn
      ? columnTasks.length          // dropped on column → goes to end
      : columnTasks.findIndex((t) => t._id === overId);

    const reordered = arrayMove(
      columnTasks,
      oldIndex === -1 ? columnTasks.length - 1 : oldIndex,
      newIndex  === -1 ? columnTasks.length - 1 : newIndex
    );

    // Assign new order values
    const updatedTasks = tasks.map((t) => {
      const reorderedTask = reordered.find((r) => r._id === t._id);
      if (reorderedTask) {
        return { ...t, status: newStatus, order: reordered.indexOf(reorderedTask) };
      }
      return t;
    });

    setTasks(updatedTasks);

    // Persist to DB
    try {
      const newOrder = reordered.indexOf(
        reordered.find((t) => t._id === activeId)!
      );
      await updateTaskStatus(activeId, newStatus, newOrder);
    } catch {
      toast.error('Failed to save task position');
      setTasks(initialTasks); // rollback on error
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 p-6 h-full overflow-x-auto">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getColumnTasks(col.id)}
            projectId={projectId}
            currentUserId={currentUserId}
            members={members}
          />
        ))}
      </div>

      {/* Drag Overlay — shows a ghost of the dragged card */}
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} overlay />}
      </DragOverlay>

    </DndContext>
  );
}
