import { getTeamMembers } from '@/lib/actions/user.actions';
import { getProjects }    from '@/lib/actions/project.actions';
import { auth }           from '@/lib/auth/auth';
import { headers }        from 'next/headers';
import { redirect }       from 'next/navigation';
import TeamList           from './_components/TeamList';

export default async function TeamPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const [members, projects] = await Promise.all([
    getTeamMembers(),
    getProjects(),
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <TeamList members={members} projects={projects} />
    </div>
  );
}
