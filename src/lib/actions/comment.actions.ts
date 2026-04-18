'use server';
import connectDB      from '@/lib/db';
import Comment        from '@/models/Comment';
import { auth }       from '@/lib/auth/auth';
import { headers }    from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose       from 'mongoose';

async function attachAuthors(comments: any[]) {
  if (comments.length === 0) return comments;
  const ids = [...new Set(comments.map((c) => c.author))];
  const users = await mongoose.connection.db!
    .collection('user')
    .find({ id: { $in: ids } })
    .toArray();
  const map = Object.fromEntries(users.map((u) => [u.id, u]));
  return comments.map((c) => ({
    ...c,
    author: map[c.author]
      ? { _id: map[c.author].id, name: map[c.author].name, image: map[c.author].image ?? null }
      : { _id: c.author, name: 'Unknown', image: null },
  }));
}

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

  // Fetch from Better-Auth's 'user' collection
  const user = await mongoose.connection.db!
    .collection('user')
    .findOne({ id: session.user.id });

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

export async function getCommentsByTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');
  await connectDB();

  const raw = await Comment.find({ task: taskId }).sort({ createdAt: 1 }).lean();
  const withAuthors = await attachAuthors(JSON.parse(JSON.stringify(raw)));
  return withAuthors;
}

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
