'use client';

import { useState }         from 'react';
import MemberCard           from './MemberCard';
import InviteMemberModal    from './InviteMemberModal';
import { Search, UserPlus } from 'lucide-react';
import type { TeamMember } from '@/lib/actions/user.actions';

interface Project {
  _id:  string;
  name: string;
}

interface Props {
  members:  TeamMember[];
  projects: Project[];
}

export default function TeamList({ members, projects }: Props) {
  const [search,      setSearch]      = useState('');
  const [inviteOpen,  setInviteOpen]  = useState(false);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {members.length} team member{members.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 pr-4 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 w-52 transition-all"
            />
          </div>

          {/* Invite button */}
          <button
            onClick={() => setInviteOpen(true)}
            className="h-9 px-4 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-400 text-sm">
            No members found matching &quot;{search}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projects={projects}
      />
    </div>
  );
}
