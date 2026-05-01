'use server';

import connectDB     from '@/lib/db';
import Task          from '@/models/Task';
import { auth }      from '@/lib/auth/auth';
import { headers }   from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose      from 'mongoose';

export interface TeamMember {
  _id:       string;
  name:      string;
  email:     string;
  image?:    string | null;
  role:      string;
  completed: number;
  active:    number;
}

// ── Get all team members with task stats ──────────────────────
export async function getTeamMembers(): Promise<TeamMember[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();
  const db    = mongoose.connection.db!;
  const users = await db.collection('user').find({}).toArray();
  if (!users.length) return [];

  const userIds    = users.map((u) => u._id);
  const taskStats  = await Task.aggregate([
    { $match: { assignee: { $in: userIds } } },
    {
      $group: {
        _id:       '$assignee',
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        active: {
          $sum: {
            $cond: [{ $in: ['$status', ['todo', 'in-progress', 'in-review', 'backlog']] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsMap = Object.fromEntries(
    taskStats.map((s) => [s._id.toString(), { completed: s.completed, active: s.active }])
  );

  return users.map((u) => ({
    _id:       u._id.toString(),
    name:      u.name,
    email:     u.email,
    image:     u.image ?? null,
    role:      u.role ?? 'member',
    completed: statsMap[u._id.toString()]?.completed ?? 0,
    active:    statsMap[u._id.toString()]?.active    ?? 0,
  }));
}

// ── Update a member's role (admin only) ───────────────────────
export async function updateMemberRole(
  memberId: string,
  newRole:  'admin' | 'member',
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  // Only admins can change roles
  if ((session.user as any).role !== 'admin') throw new Error('Forbidden');

  // Prevent removing your own admin role
  if (session.user.id === memberId && newRole !== 'admin') {
    throw new Error('You cannot remove your own admin role');
  }

  await connectDB();
  const db = mongoose.connection.db!;

  await db.collection('user').updateOne(
    { _id: new mongoose.Types.ObjectId(memberId) },
    { $set: { role: newRole } }
  );

  revalidatePath('/team');
}
