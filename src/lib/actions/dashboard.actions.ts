'use server';

import connectDB  from '@/lib/db';
import Task       from '@/models/Task';
import Comment    from '@/models/Comment';
import Project    from '@/models/Project';
import { auth }   from '@/lib/auth/auth';
import { headers } from 'next/headers';
import mongoose   from 'mongoose';

// ── Stat cards ────────────────────────────────────────────────
export async function getDashboardStats() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const now       = new Date();
  const lastWeek  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeks  = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    totalTasks, totalTasksLastWeek,
    inProgress, inProgressLastWeek,
    inReview,   inReviewLastWeek,
    openIssues, openIssuesLastWeek,
  ] = await Promise.all([
    Task.countDocuments({}),
    Task.countDocuments({ createdAt: { $lt: lastWeek } }),
    Task.countDocuments({ status: 'in-progress' }),
    Task.countDocuments({ status: 'in-progress', createdAt: { $lt: lastWeek } }),
    Task.countDocuments({ status: 'in-review' }),
    Task.countDocuments({ status: 'in-review', createdAt: { $lt: lastWeek } }),
    Task.countDocuments({ status: { $in: ['todo', 'backlog'] } }),
    Task.countDocuments({ status: { $in: ['todo', 'backlog'] }, createdAt: { $lt: lastWeek } }),
  ]);

  function diff(current: number, previous: number) {
    const d = current - previous;
    return { value: Math.abs(d), positive: d >= 0 };
  }

  return {
    totalTasks:  { count: totalTasks,  ...diff(totalTasks,  totalTasksLastWeek)  },
    inProgress:  { count: inProgress,  ...diff(inProgress,  inProgressLastWeek)  },
    codeReviews: { count: inReview,    ...diff(inReview,    inReviewLastWeek)    },
    openIssues:  { count: openIssues,  ...diff(openIssues,  openIssuesLastWeek)  },
  };
}

// ── Weekly activity (last 7 days) ─────────────────────────────
export async function getWeeklyActivity() {
  await connectDB();

  const days   = 7;
  const result = [];

  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const [tasks, comments] = await Promise.all([
      Task.countDocuments({ createdAt: { $gte: start, $lte: end } }),
      Comment.countDocuments({ createdAt: { $gte: start, $lte: end } }),
    ]);

    const inReview = await Task.countDocuments({
      status: 'in-review',
      updatedAt: { $gte: start, $lte: end },
    });

    result.push({
      day:      start.toLocaleDateString('en-US', { weekday: 'short' }),
      tasks,
      reviews:  inReview,
      comments,
    });
  }

  return result;
}

// ── Project progress ──────────────────────────────────────────
export async function getProjectProgress() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const projects = await Project.find({ members: session.user.id })
    .sort({ updatedAt: -1 })
    .lean();

  if (!projects.length) return [];

  const results = await Promise.all(
    projects.map(async (p) => {
      const [total, done] = await Promise.all([
        Task.countDocuments({ project: p._id }),
        Task.countDocuments({ project: p._id, status: 'done' }),
      ]);
      return {
        _id:      p._id.toString(),
        name:     p.name,
        total,
        done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    })
  );

  return JSON.parse(JSON.stringify(results));
}

// ── Recent tasks ──────────────────────────────────────────────
export async function getRecentTasks() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const tasks = await Task.find({})
    .sort({ updatedAt: -1 })
    .limit(6)
    .lean();

  if (!tasks.length) return [];

  const db      = mongoose.connection.db!;
  const userIds = [...new Set(tasks.flatMap((t) => [
    t.assignee?.toString(), t.createdBy?.toString(),
  ]).filter(Boolean))] as string[];

  const users = await db.collection('user').find({
    _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).toArray();

  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return JSON.parse(JSON.stringify(tasks.map((t) => ({
    _id:      t._id.toString(),
    title:    t.title,
    status:   t.status,
    priority: t.priority,
    tags:     t.tags ?? [],
    assignee: t.assignee
      ? { name: userMap[t.assignee.toString()]?.name ?? 'Unknown', image: userMap[t.assignee.toString()]?.image ?? null }
      : null,
  }))));
}

// ── Top contributors ──────────────────────────────────────────
export async function getTopContributors() {
  await connectDB();

  const db = mongoose.connection.db!;

  const stats = await Task.aggregate([
    { $match: { assignee: { $exists: true, $ne: null } } },
    {
      $group: {
        _id:       '$assignee',
        completed: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        active:    { $sum: { $cond: [{ $ne:  ['$status', 'done'] }, 1, 0] } },
        total:     { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 4 },
  ]);

  if (!stats.length) return [];

  const ids   = stats.map((s) => s._id);
  const users = await db.collection('user').find({
    _id: { $in: ids },
  }).toArray();

  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return JSON.parse(JSON.stringify(stats.map((s, i) => ({
    rank:      i + 1,
    _id:       s._id.toString(),
    name:      userMap[s._id.toString()]?.name  ?? 'Unknown',
    image:     userMap[s._id.toString()]?.image ?? null,
    completed: s.completed,
    active:    s.active,
    total:     s.total,
  }))));
}
