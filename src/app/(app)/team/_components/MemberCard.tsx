'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Shield, User, Eye } from 'lucide-react';
import type { TeamMember } from '@/lib/actions/user.actions';


const ROLE_CONFIG: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
  admin: {
    label: 'Admin',
    icon:  <Shield className="w-3 h-3" />,
    class: 'bg-violet-50 text-violet-600 border border-violet-200',
  },
  member: {
    label: 'Member',
    icon:  <User className="w-3 h-3" />,
    class: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  },
  viewer: {
    label: 'Viewer',
    icon:  <Eye className="w-3 h-3" />,
    class: 'bg-gray-50 text-gray-500 border border-gray-200',
  },
};

export default function MemberCard({ member }: { member: TeamMember }) {
  const role = ROLE_CONFIG[member.role?.toLowerCase()] ?? ROLE_CONFIG.member;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">

      {/* Header — avatar + name */}
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

      {/* Role badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${role.class}`}>
          {role.icon}
          {role.label}
        </span>
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
