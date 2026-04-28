'use client';

import { useState, useTransition } from 'react';
import { addMemberToProject }      from '@/lib/actions/project.actions';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  _id:  string;
  name: string;
}

interface Props {
  open:      boolean;
  onClose:   () => void;
  projects:  Project[];
}

type Status = 'idle' | 'success' | 'error';

export default function InviteMemberModal({ open, onClose, projects }: Props) {
  const [email,      setEmail]      = useState('');
  const [projectId,  setProjectId]  = useState('');
  const [status,     setStatus]     = useState<Status>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [isPending,  startTransition] = useTransition();

  function handleClose() {
    setEmail('');
    setProjectId('');
    setStatus('idle');
    setErrorMsg('');
    onClose();
  }

  function handleInvite() {
    if (!email.trim())    return toast.error('Enter an email address');
    if (!projectId)       return toast.error('Select a project');

    setStatus('idle');
    setErrorMsg('');

    startTransition(async () => {
      try {
        await addMemberToProject(projectId, email.trim());
        setStatus('success');
        toast.success(`${email} added to project!`);
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message ?? 'Failed to add member');
        toast.error(err.message ?? 'Failed to add member');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Member
          </DialogTitle>
          <DialogDescription>
            Add an existing user to one of your projects by their email address.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Email address</label>
            <Input
              autoFocus
              type="email"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
              className="text-sm"
            />
          </div>

          {/* Project select */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Add to project</label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Success state */}
          {status === 'success' && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span><strong>{email}</strong> has been added successfully.</span>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              {status === 'success' ? 'Done' : 'Cancel'}
            </Button>
            {status !== 'success' && (
              <Button
                size="sm"
                onClick={handleInvite}
                disabled={isPending || !email.trim() || !projectId}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isPending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />Adding...</>
                  : <><UserPlus className="w-3.5 h-3.5 mr-1.5" />Add to Project</>
                }
              </Button>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
