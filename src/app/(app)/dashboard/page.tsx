import {
  getDashboardStats,
  getWeeklyActivity,
  getProjectProgress,
  getRecentTasks,
  getTopContributors,
} from '@/lib/actions/dashboard.actions';
import { getProjects }  from '@/lib/actions/project.actions';
import { auth }         from '@/lib/auth/auth';
import { headers }      from 'next/headers';
import { redirect }     from 'next/navigation';
import DashboardClient from './_components/DashboardClient';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const [stats, activity, projects, recentTasks, contributors] = await Promise.all([
    getDashboardStats(),
    getWeeklyActivity(),
    getProjectProgress(),
    getRecentTasks(),
    getTopContributors(),
  ]);

  return (
    <DashboardClient
      userName={session.user.name}
      stats={stats}
      activity={activity}
      projects={projects}
      recentTasks={recentTasks}
      contributors={contributors}
    />
  );
}
