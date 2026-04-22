'use server';

import connectDB          from '@/lib/db';
import Task, { TaskStatus } from '@/models/Task';
import { auth }           from '@/lib/auth/auth';
import { headers }        from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose           from 'mongoose';

// ── Helper — fetch users from Better-Auth collection ──────────
async function getUserMap(ids: string[]) {
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
      email: u.email,
      image: u.image ?? null,
    }])
  );
}

// ── Create Task ───────────────────────────────────────────────
export async function createTask(formData: {
  title:       string;
  description?: string;
  priority?:   'low' | 'medium' | 'high';
  projectId:   string;
  assigneeId?: string;
  dueDate?:    string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const lastTask = await Task.findOne({
    project: formData.projectId,
    status:  'todo',
  }).sort({ order: -1 });

  const task = await Task.create({
    title:       formData.title,
    description: formData.description,
    priority:    formData.priority ?? 'medium',
    project:     formData.projectId,
    assignee:    formData.assigneeId,
    createdBy:   session.user.id,
    dueDate:     formData.dueDate,
    status:      'todo',
    order:       (lastTask?.order ?? 0) + 1,
  });

  revalidatePath(`/projects/${formData.projectId}`);
  return JSON.parse(JSON.stringify(task));
}

// ── Get All Tasks for a Project ───────────────────────────────
export async function getTasksByProject(projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  // Fetch tasks without populate
  const tasks = await Task.find({ project: projectId })
    .sort({ status: 1, order: 1 })
    .lean();

  if (!tasks.length) return [];

  // Collect all user IDs from assignee + createdBy
  const userIds = tasks.flatMap((t) => [
    t.assignee?.toString(),
    t.createdBy?.toString(),
  ]).filter(Boolean) as string[];

  const userMap = await getUserMap(userIds);

  // Attach user objects manually
  const serialized = tasks.map((t) => ({
    _id:         t._id.toString(),
    title:       t.title,
    description: t.description,
    status:      t.status,
    priority:    t.priority,
    order:       t.order,
    dueDate:     t.dueDate,
    project:     t.project.toString(),
    createdBy:   userMap[t.createdBy?.toString() ?? ''] ?? null,
    assignee:    t.assignee ? (userMap[t.assignee.toString()] ?? null) : null,
    createdAt:   t.createdAt,
    updatedAt:   t.updatedAt,
  }));

  return JSON.parse(JSON.stringify(serialized));
}

// ── Update Task Status (Kanban drag) ──────────────────────────
export async function updateTaskStatus(
  taskId:    string,
  newStatus: TaskStatus,
  newOrder:  number,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const task = await Task.findByIdAndUpdate(
    taskId,
    { status: newStatus, order: newOrder },
    { new: true }
  );

  if (!task) throw new Error('Task not found');

  revalidatePath(`/projects/${task.project}`);
  return JSON.parse(JSON.stringify(task));
}

// ── Update Task Details ───────────────────────────────────────
export async function updateTask(
  taskId:  string,
  updates: {
    title?:       string;
    description?: string;
    priority?:    'low' | 'medium' | 'high';
    assigneeId?:  string;
    dueDate?:     string;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      ...(updates.title       !== undefined && { title:       updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.priority    !== undefined && { priority:    updates.priority }),
      ...(updates.dueDate     !== undefined && { dueDate:     updates.dueDate }),
      ...(updates.assigneeId  !== undefined && {
        assignee: updates.assigneeId === 'unassigned' ? null : updates.assigneeId
      }),
    },
    { new: true }
  );

  if (!task) throw new Error('Task not found');

  revalidatePath(`/projects/${task.project}`);
  return JSON.parse(JSON.stringify(task));
}

// ── Delete Task ───────────────────────────────────────────────
export async function deleteTask(taskId: string, projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  await Task.findByIdAndDelete(taskId);
  revalidatePath(`/projects/${projectId}`);
}
