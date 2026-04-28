'use server';

import connectDB         from '@/lib/db';
import Comment           from '@/models/Comment';
import { auth }          from '@/lib/auth/auth';
import { headers }       from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose          from 'mongoose';

// ✅ Look up by ObjectId _id (how Project/Task models store user refs)
async function attachAuthors(comments: any[]) {
  if (comments.length === 0) return comments;

  const db  = mongoose.connection.db!;
  const ids = [...new Set(comments.map((c) => c.author.toString()))];

  const users = await db.collection('user').find({
    _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
  }).toArray();

  const map = Object.fromEntries(
    users.map((u) => [u._id.toString(), {
      _id:   u._id.toString(),
      name:  u.name,
      image: u.image ?? null,
    }])
  );

  return comments.map((c) => {
    const authorId = c.author.toString();
    return {
      ...c,
      author: map[authorId] ?? { _id: authorId, name: 'Unknown', image: null },
    };
  });
}

// ── Create Comment ────────────────────────────────────────────
export async function createComment(formData: {
  content:      string;
  taskId:       string;
  projectId:    string;
  codeSnippet?: string;
  language?:    string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const created = await Comment.create({
    content:     formData.content,
    codeSnippet: formData.codeSnippet,
    language:    formData.language ?? 'typescript',
    task:        formData.taskId,
    author:      session.user.id,
  });

  // ✅ Fetch author by ObjectId for the returned comment
  const db   = mongoose.connection.db!;
  const user = await db.collection('user').findOne({
    _id: new mongoose.Types.ObjectId(session.user.id),
  });

  const comment = {
    ...JSON.parse(JSON.stringify(created)),
    author: {
      _id:   session.user.id,
      name:  user?.name  ?? session.user.name,
      image: user?.image ?? null,
    },
  };

  revalidatePath(`/projects/${formData.projectId}`);
  return comment;
}

// ── Get Comments for a Task ───────────────────────────────────
export async function getCommentsByTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const raw = await Comment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .lean();

  const withAuthors = await attachAuthors(JSON.parse(JSON.stringify(raw)));
  return withAuthors;
}

// ── Delete Comment ────────────────────────────────────────────
export async function deleteComment(commentId: string, projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (comment.author.toString() !== session.user.id) throw new Error('Forbidden');

  await Comment.findByIdAndDelete(commentId);
  revalidatePath(`/projects/${projectId}`);
}
