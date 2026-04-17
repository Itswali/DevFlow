'use server';

import  connectDB        from '@/lib/db';
import Comment             from '@/models/Comment';
import { auth }            from '@/lib/auth/auth';
import { headers }         from 'next/headers';
import { revalidatePath }  from 'next/cache';

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

  // Populate author so the client gets name + image immediately
  const comment = await Comment.findById(created._id)
    .populate('author', 'name image');

  revalidatePath(`/projects/${formData.projectId}`);
  return JSON.parse(JSON.stringify(comment));
}

// ── Get Comments for a Task ───────────────────────────────────
export async function getCommentsByTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const comments = await Comment.find({ task: taskId })
    .populate('author', 'name image')
    .sort({ createdAt: 1 });

  return JSON.parse(JSON.stringify(comments));
}

// ── Delete Comment ────────────────────────────────────────────
export async function deleteComment(commentId: string, projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error('Comment not found');

  // Only author can delete their own comment
  if (comment.author.toString() !== session.user.id) {
    throw new Error('Forbidden');
  }

  await Comment.findByIdAndDelete(commentId);
  revalidatePath(`/projects/${projectId}`);
}
