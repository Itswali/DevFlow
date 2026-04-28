'use server';

import connectDB   from '@/lib/db';
import Task        from '@/models/Task';
import Comment     from '@/models/Comment';
import { auth }    from '@/lib/auth/auth';
import { headers } from 'next/headers';
import mongoose    from 'mongoose';

async function getUserMapByObjectId(ids: string[]) {
  const db        = mongoose.connection.db!;
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};

  const users = await db.collection('user').find({
    _id: { $in: uniqueIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).toArray();

  return Object.fromEntries(
    users.map((u) => [u._id.toString(), {
      _id:   u._id.toString(),
      name:  u.name,
      image: u.image ?? null,
    }])
  );
}

// ── Get all in-review tasks ───────────────────────────────────
export async function getReviewTasks() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const tasks = await Task.find({ status: 'in-review' })
    .sort({ updatedAt: -1 })
    .lean();

  if (!tasks.length) return [];

  const userIds = tasks.flatMap((t) => [
    t.assignee?.toString(),
    t.createdBy?.toString(),
  ]).filter(Boolean) as string[];

  const userMap = await getUserMapByObjectId(userIds);

  return JSON.parse(JSON.stringify(tasks.map((t) => ({
    _id:         t._id.toString(),
    title:       t.title,
    description: t.description ?? '',
    status:      t.status,
    priority:    t.priority,
    tags:        t.tags ?? [],
    project:     t.project.toString(),
    assignee:    t.assignee ? (userMap[t.assignee.toString()] ?? null) : null,
    createdBy:   userMap[t.createdBy?.toString() ?? ''] ?? null,
    dueDate:     t.dueDate ?? null,
    updatedAt:   t.updatedAt,
  }))));
}

// ── Get comments for a task ───────────────────────────────────
export async function getReviewComments(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const raw = await Comment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .lean();

  if (!raw.length) return [];

  // ✅ author is stored as ObjectId — look up by _id not string id
  const authorIds = [...new Set(raw.map((c) => c.author.toString()))];
  const userMap   = await getUserMapByObjectId(authorIds);

  return JSON.parse(JSON.stringify(raw.map((c) => ({
    _id:         c._id.toString(),
    content:     c.content,
    codeSnippet: c.codeSnippet ?? null,
    language:    c.language ?? 'typescript',
    author:      userMap[c.author.toString()] ?? {
      _id:   c.author.toString(),
      name:  'Unknown',
      image: null,
    },
    createdAt:   c.createdAt,
  }))));
}
