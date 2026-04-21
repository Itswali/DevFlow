import Navbar  from './Navbar';
import Sidebar from './Sidebar';
import { getProjects } from '@/lib/actions/project.actions';
import { auth }        from '@/lib/auth/auth';
import { headers }     from 'next/headers';
import { redirect }    from 'next/navigation';

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/auth/login');

  const projects = await getProjects();

  return (
    <div className="flex h-screen overflow-hidden">

      <Sidebar projects={projects} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar user={session.user} />

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
