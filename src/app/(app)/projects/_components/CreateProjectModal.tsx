'use client';

import { useState, useTransition } from 'react';
import { createProject } from '@/lib/actions/project.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProjectModal() {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState('');
  const [desc, setDesc]       = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!name.trim()) return toast.error('Project name is required');

    startTransition(async () => {
      try {
        await createProject({ name: name.trim(), description: desc.trim() });
        toast.success('Project created!');
        setOpen(false);
        setName('');
        setDesc('');
      } catch (err) {
        toast.error('Failed to create project');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a new project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              placeholder="e.g. DevFlow Backend"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="desc">Description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea
              id="desc"
              placeholder="What is this project about?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                'Create Project'
              )}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
