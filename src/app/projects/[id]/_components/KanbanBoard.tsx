'use client'
import { useState } from 'react'
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
import { updateTaskStatus } from '@/lib/actions/task.actions';
import { toast } from 'sonner';

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';

export interface Task {
  _id: string;
  title: string;
  description: string;

}


export default function KanbanBoard() {
  return (
    <div>

    </div>
  )
}
