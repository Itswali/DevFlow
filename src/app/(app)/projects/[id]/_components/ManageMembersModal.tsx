'use client';

import { useState, useTransition }        from 'react';
import { addMemberToProject, removeMemberFromProject } from '@/lib/actions/project.actions';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, UserPlus, UserMinus, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  _id:    string;
  name:   string;
  email:  string;
  image?: string;
}

interface Props {
  projectId:     string;
  members:       Member[];
  ownerId:       string;
  currentUserId: string;
}

export default function ManageMembersModal({
  projectId,
  members: initialMembers,
  ownerId,
  currentUserId,
}: Props) {
  const [open, setOpen]         = useState(false);
  const [members, setMembers]   = useState<Member[]>(initialMembers);
  const [email, setEmail]       = useState('');
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserId === ownerId;

  function handleAdd() {
    if (!email.trim()) return toast.error('Enter an email address');

    startTransition(async () => {
      try {
        const newMember = await addMemberToProject(projectId, email.trim());
        setMembers((prev) => [...prev, newMember]);
        setEmail('');
        toast.success('Member added!');
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to add member');
      }
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      try {
        await removeMemberFromProject(projectId, memberId);
        setMembers((prev) => prev.filter((m) => m._id !== memberId));
        toast.success('Member removed');
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to remove member');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          Members ({members.length})
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
          <DialogDescription>
            {isOwner
              ? 'Add or remove members from this project'
              : 'People with access to this project'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Add member — owner only */}
          {isOwner && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="text-sm"
              />
              <Button onClick={handleAdd} disabled={isPending} size="sm">
                {isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <UserPlus className="w-4 h-4" />
                }
              </Button>
            </div>
          )}

          {/* Member list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={member.image} />
                    <AvatarFallback className="text-xs">
                      {member.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      {member._id === ownerId && (
                        <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Remove — owner only, can't remove self or owner */}
                {isOwner && member._id !== ownerId && (
                  <button
                    onClick={() => handleRemove(member._id)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
