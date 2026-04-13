import { getProjectById }    from '@/lib/actions/project.actions';
import { getTasksByProject } from '@/lib/actions/task.actions';
import KanbanBoard           from './_components/KanbanBoard';
import { notFound }          from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function ProjectPage({ params }: Props) {
  const [project, tasks] = await Promise.all([
    getProjectById(params.id),
    getTasksByProject(params.id),
  ]);

  if (!project) notFound();

  return (
    <div className="flex flex-col h-screen">

      {/* Project Header */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold">{project.name}</h1>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {project.description}
          </p>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          projectId={params.id}
          initialTasks={tasks}
          members={project.members}
        />
      </div>

    </div>
  );
}
