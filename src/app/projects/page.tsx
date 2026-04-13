import { getProjects } from '@/lib/actions/project.actions';
import ProjectCard from './_components/ProjectCard';
import CreateProjectModal from './_components/CreateProjectModal';

export default async function DashboardPage() {
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

      {/* Project Grid */}
      {projects.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No projects yet.</p>
          <p className="text-sm mt-1">Create your first project to get started.</p>
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
