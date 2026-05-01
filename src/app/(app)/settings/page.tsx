import { auth }          from '@/lib/auth/auth';
import { headers }       from 'next/headers';
import { redirect }      from 'next/navigation';
import SettingsClient    from './_components/SettingsClient';

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/sign-in');

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
      </div>
      <SettingsClient user={{
        id:    session.user.id,
        name:  session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        role:  (session.user as any).role ?? 'member',
      }} />
    </div>
  );
}
