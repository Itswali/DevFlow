import { getProjects }       from '@/lib/actions/project.actions';
import { auth }              from '@/lib/auth/auth';
import { headers }           from 'next/headers';
import { redirect }          from 'next/navigation';
import ProjectCard from '../projects/_components/ProjectCard';
import CreateProjectModal from '../projects/_components/CreateProjectModal';
import { FolderKanban }      from 'lucide-react';
export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const projects = await getProjects();

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateProjectModal />
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FolderKanban className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-lg">No projects yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first project to get started
            </p>
          </div>
          <CreateProjectModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: any) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}

    </div>
  );
}
