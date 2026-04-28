import { getReviewTasks }  from '@/lib/actions/review.actions';
import { auth }            from '@/lib/auth/auth';
import { headers }         from 'next/headers';
import { redirect }        from 'next/navigation';
import ReviewClient        from './_components/ReviewClient';

export default async function CodeReviewsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  const tasks = await getReviewTasks();

  return (
    <div className="h-full flex flex-col">
      <ReviewClient
        tasks={tasks}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
        currentUserImage={session.user.image ?? null}
      />
    </div>
  );
}
