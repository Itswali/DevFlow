'use client';

import { useTransition }  from 'react';
import { updateMemberRole } from '@/lib/actions/user.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TeamMember } from '@/lib/actions/user.actions';

interface Props {
  member:          TeamMember;
  currentUserId:   string;
  currentUserRole: string;
}

const ROLE_STYLE: Record<string, string> = {
  admin:  'bg-violet-50 text-violet-600 border border-violet-200',
  member: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
};

export default function MemberCard({ member, currentUserId, currentUserRole }: Props) {
  const [isPending, startTransition] = useTransition();
  const isAdmin     = currentUserRole === 'admin';
  const isSelf      = currentUserId === member._id;
  const canEditRole = isAdmin && !isSelf; // admins can change others, not themselves

  function handleRoleChange(newRole: string) {
    if (newRole === member.role) return;
    startTransition(async () => {
      try {
        await updateMemberRole(member._id, newRole as 'admin' | 'member');
        toast.success(`${member.name} is now ${newRole}`);
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to update role');
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">

      {/* Avatar + name */}
      <div className="flex items-center gap-3.5 mb-4">
        <Avatar className="w-14 h-14 rounded-2xl border border-gray-100 shadow-sm">
          <AvatarImage src={member.image ?? undefined} className="object-cover" />
          <AvatarFallback className="rounded-2xl text-base font-semibold bg-violet-100 text-violet-600">
            {member.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{member.email}</p>
        </div>
      </div>

      {/* Role — dropdown for admin, static badge otherwise */}
      <div className="mb-4 flex items-center gap-2">
        {canEditRole ? (
          <div className="relative flex items-center">
            {isPending && (
              <Loader2 className="w-3 h-3 animate-spin text-gray-400 absolute -left-5" />
            )}
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={isPending}
              className={`
                text-xs font-medium px-2.5 py-1 rounded-lg appearance-none cursor-pointer
                pr-6 focus:outline-none focus:ring-2 focus:ring-violet-200
                disabled:opacity-50 disabled:cursor-not-allowed
                ${ROLE_STYLE[member.role] ?? ROLE_STYLE.member}
              `}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            {/* Dropdown chevron */}
            <span className="pointer-events-none absolute right-1.5 text-current opacity-60 text-[10px]">
              ▾
            </span>
          </div>
        ) : (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${ROLE_STYLE[member.role] ?? ROLE_STYLE.member}`}>
            {member.role === 'admin'
              ? <Shield className="w-3 h-3" />
              : <User   className="w-3 h-3" />
            }
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        )}
        {isSelf && (
          <span className="text-[10px] text-gray-400">(you)</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-gray-900 leading-none">{member.completed}</p>
          <p className="text-[11px] text-gray-400 mt-1">Completed</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-gray-900 leading-none">{member.active}</p>
          <p className="text-[11px] text-gray-400 mt-1">Active</p>
        </div>
      </div>

    </div>
  );
}
