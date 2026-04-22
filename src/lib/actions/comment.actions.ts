'use server';
import connectDB      from '@/lib/db';
import Comment        from '@/models/Comment';
import { auth }       from '@/lib/auth/auth';
import { headers }    from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose       from 'mongoose';



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

  const comment = await Comment.create({
    content:     formData.content,
    codeSnippet: formData.codeSnippet,
    language:    formData.language ?? 'typescript',
    task:        formData.taskId,
    author:      session.user.id,
  });

  // Fetch author from Better-Auth collection
  const db     = mongoose.connection.db!;
  const author = await db.collection('user').findOne({
    _id: new mongoose.Types.ObjectId(session.user.id),
  });

  revalidatePath(`/projects/${formData.projectId}`);

  return JSON.parse(JSON.stringify({
    _id:         comment._id.toString(),
    content:     comment.content,
    codeSnippet: comment.codeSnippet,
    language:    comment.language,
    task:        comment.task.toString(),
    author: {
      _id:   session.user.id,
      name:  author?.name  ?? session.user.name,
      email: author?.email ?? session.user.email,
      image: author?.image ?? null,
    },
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
}

export async function getCommentsByTask(taskId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const comments = await Comment.find({ task: taskId })
    .sort({ createdAt: 1 })
    .lean();

  if (!comments.length) return [];

  const db      = mongoose.connection.db!;
  const userIds = [...new Set(comments.map((c) => c.author.toString()))];

  const users = await db.collection('user').find({
    _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).toArray();

  const userMap = Object.fromEntries(
    users.map((u) => [u._id.toString(), {
      _id:   u._id.toString(),
      name:  u.name,
      email: u.email,
      image: u.image ?? null,
    }])
  );

  return JSON.parse(JSON.stringify(
    comments.map((c) => ({
      _id:         c._id.toString(),
      content:     c.content,
      codeSnippet: c.codeSnippet,
      language:    c.language,
      task:        c.task.toString(),
      author:      userMap[c.author.toString()] ?? { _id: c.author.toString(), name: 'Unknown', image: null },
      createdAt:   c.createdAt,
      updatedAt:   c.updatedAt,
    }))
  ));
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
