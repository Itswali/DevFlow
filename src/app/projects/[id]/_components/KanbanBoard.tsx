'use client'
import { useState } from 'react'
// import {
//   DndContext,
//   DragEndEvent,
//   DragOverEvent,
//   DragOverlay,
//   DragStartEvent,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from '@dnd-kit/core';
// import { arrayMove } from '@dnd-kit/sortable';
import { updateTaskStatus } from '@/lib/actions/task.actions';
import { toast } from 'sonner';
import KanbanColumn from './KanbanColumn';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  order: number;
  assignee?: { id: string; name: string; image?: string };
  dueDate?: string;
}

export const COLUMNS: { id: TaskStatus; label: string } [] = [
  { id: 'todo',        label: '📋 To Do'      },
  { id: 'in-progress', label: '🔄 In Progress' },
  { id: 'in-review',   label: '👀 In Review'   },
  { id: 'done',        label: '✅ Done'        },
];

interface Props {
  projectId: string;
  initialTasks: Task[];
  members: { _id: string; name: string; image?: string}[];
}



export default function KanbanBoard({ projectId, initialTasks, members}: Props) {

  const [tasks, setTasks]  = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // const sensors = useSensors(
  //   useSensor(PointerSensor, {
  //     activationConstraint: { distance: 5 },
  //   })
  // );

  function getColumnTasks(status: TaskStatus) {
    return tasks.filter((t) => t.status === status).sort((a,b) => a.order - b.order);
  }
  // function handleTaskClick(task: Task){
  //   setSelectedTask((prev) => (prev?._id === task._id ? null : task));
  // }

  async function handleMoveToColumn(targetStatus: TaskStatus) {
     if (!selectedTask || selectedTask.status === targetStatus || isMoving) return;

     const previousTasks = tasks;
     setTasks((prev) =>
      prev.map((t) =>
        t._id === selectedTask._id ? { ...t, status: targetStatus } : t
      )
    );
     setSelectedTask(null);
    setIsMoving(true);

    try {
      const targetColumnTasks = getColumnTasks(targetStatus);
      const newOrder = targetColumnTasks.length; // append to end of column
      await updateTaskStatus(selectedTask._id, targetStatus, newOrder);
    } catch {
      toast.error('Failed to move task');
      setTasks(previousTasks); // rollback
    } finally {
      setIsMoving(false);
    }

  }

 return (
    <div className="flex flex-col gap-4 h-full">

      {/* Move-to picker — shown when a task is selected */}
      {selectedTask && (
        <div className="flex items-center gap-3 px-6 py-3 bg-muted/60 border rounded-lg mx-6">
          <span className="text-sm text-muted-foreground font-medium shrink-0">
            Move &quot;{selectedTask.title}&quot; to:
          </span>
          <div className="flex gap-2 flex-wrap">
            {COLUMNS.map((col) => {
              const isCurrent = col.id === selectedTask.status;
              return (
                <button
                  key={col.id}
                  disabled={isCurrent || isMoving}
                  onClick={() => handleMoveToColumn(col.id)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                    ${isCurrent
                      ? 'bg-primary text-primary-foreground cursor-default opacity-70'
                      : 'bg-background border hover:bg-accent hover:text-accent-foreground cursor-pointer'
                    }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="ml-auto text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* Kanban columns */}
      <div className="flex gap-4 px-6 pb-6 h-full overflow-x-auto">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={getColumnTasks(col.id)}
            projectId={projectId}
            members={members}
            // selectedTaskId={selectedTask?._id}
            // onTaskClick={handleTaskClick}
          />
        ))}
      </div>

    </div>
  );
}
