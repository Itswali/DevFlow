'use client';

import Link              from 'next/link';
import { useTransition } from 'react';
import { useRouter }     from 'next/navigation';
import { deleteProject } from '@/lib/actions/project.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

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
    owner:        { _id: string };
    updatedAt:    string;
  };
  doneTasks:     number;
  totalTasks:    number;
  currentUserId: string;
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

export default function ProjectCard({ project, doneTasks, totalTasks, currentUserId }: Props) {
  const accent         = getAccent(project.name);
  const progress       = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const visibleMembers = project.members.slice(0, 3);
  const extraMembers   = project.members.length - 3;
  const updatedAt      = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });
  const isOwner        = currentUserId === project.owner._id;

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProject(project._id);
        toast.success('Project deleted');
        router.refresh();
      } catch (err: any) {
        toast.error(err.message ?? 'Failed to delete project');
      }
    });
  }

  return (
    // ✅ Outer div is position:relative — NOT a Link
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group">

      {/* Colored top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: accent }} />

      {/* ✅ Delete button sits OUTSIDE the Link, in its own z-layer */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-20">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="
                  w-7 h-7 rounded-lg bg-white border border-gray-200 shadow-sm
                  flex items-center justify-center
                  text-gray-400 hover:text-red-500 hover:border-red-200
                  opacity-0 group-hover:opacity-100
                  transition-all duration-150
                "
              >
                {isPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2  className="w-3.5 h-3.5" />
                }
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{project.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the project and all its tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete Project
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* ✅ Link only wraps the card content, not the delete button */}
      <Link href={`/projects/${project._id}`} className="block p-6 pt-7">

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
          <h3 className="text-base font-semibold text-gray-900 leading-tight truncate pr-8">
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

      </Link>
    </div>
  );
}
