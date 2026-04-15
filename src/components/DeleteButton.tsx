"use client"

import { Trash2 } from 'lucide-react'
import React from 'react'
import { Button } from './ui/button'
import { deleteProject } from '@/lib/actions/project.actions';

// Destructure { projectId } from props
export default function DeleteButton({ projectId }: { projectId: string }) {
  const handleDelete = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (confirm("Are you sure you want to delete this project?")) {
        // Now projectId is a simple string, not an object
        await deleteProject(projectId);
      }
    };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors"
      onClick={handleDelete}
    >
      <Trash2 className="w-4 h-4" />
      <span className="sr-only">Delete</span>
    </Button>
  )
}
