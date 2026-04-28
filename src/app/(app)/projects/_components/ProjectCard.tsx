'use client';

import Link            from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Member {
  _id:    string;
  name:   string;
  image?: string;
}

interface Props {
  project: {
    _id:          string;
    name:         string;
    description?: string;
    members:      Member[];
    updatedAt:    string;
  };
  doneTasks:  number;
  totalTasks: number;
}

const ACCENTS = [
  '#6366f1', '#ef4444', '#22c55e', '#f59e0b',
  '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6',
];

function getAccent(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export default function ProjectCard({ project, doneTasks, totalTasks }: Props) {
  const accent          = getAccent(project.name);
  const progress        = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const visibleMembers  = project.members.slice(0, 3);
  const extraMembers    = project.members.length - 3;
  const updatedAt       = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });

  return (
    <Link href={`/projects/${project._id}`} className="block group">
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">

        {/* Colored top border */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: accent }} />

        <div className="p-6 pt-7">

          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700 transition-colors leading-tight truncate">
              {project.name}
            </h3>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-400 mb-5 line-clamp-1 pl-[18px]">
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">Progress</span>
              <span className="text-xs font-semibold text-gray-700">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: accent }}
              />
            </div>
          </div>

          {/* Members + task count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {visibleMembers.map((member) => (
                  <Avatar key={member._id} className="w-7 h-7 border-2 border-white">
                    <AvatarImage src={member.image} />
                    <AvatarFallback
                      className="text-[10px] font-semibold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {member.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {extraMembers > 0 && (
                  <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                    +{extraMembers}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" style={{ color: accent }} />
              <span className="text-sm font-medium text-gray-600">{doneTasks}/{totalTasks}</span>
            </div>
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-4">Updated {updatedAt}</p>

        </div>
      </div>
    </Link>
  );
}
