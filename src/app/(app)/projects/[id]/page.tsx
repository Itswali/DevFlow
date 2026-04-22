import { getProjectById } from "@/lib/actions/project.actions";
import { getTasksByProject } from "@/lib/actions/task.actions";
import KanbanBoard from "./_components/KanbanBoard";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ManageMembersModal from "./_components/ManageMembersModal";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;

  const [session, project, tasks] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getProjectById(id),
    getTasksByProject(id),
  ]);

  if (!session) redirect("/sign-in");
  if (!project) notFound();

  const doneTasks = tasks.filter((t: any) => t.status === "done").length;
  const totalTasks = tasks.length;

  return (
    <div className="flex flex-col h-screen">
      {/* Project Header */}
      <div className="px-6 py-3 border-b flex items-center justify-between gap-4 shrink-0">
        {/* Left — name + description */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {project.name[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold leading-tight truncate">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Right — members + task count */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Task progress */}
          {totalTasks > 0 && (
            <Badge variant="secondary" className="text-xs">
              {doneTasks}/{totalTasks} done
            </Badge>
          )}

          {/* Member avatars */}
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((member: any) => (
              <Avatar
                key={member._id}
                className="w-7 h-7 border-2 border-background">
                <AvatarImage src={member.image} />
                <AvatarFallback className="text-[10px]">
                  {member.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            <ManageMembersModal
  projectId={id}
  members={project.members}
  ownerEmail={project.owner?.email ?? ''}        // 👈 safe access
  currentUserEmail={session.user.email ?? ''}    // 👈 safe access
/>
            {project.members.length > 5 && (
              <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                +{project.members.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projectId={id}
          initialTasks={tasks}
          members={project.members}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
