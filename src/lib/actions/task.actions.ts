// 'use server';

// import connectDB  from '@/lib/db';
// import Task, { TaskStatus } from '@/models/Task';
// import { auth } from '@/lib/auth/auth';
// import '@/models/User';
// import { headers } from 'next/headers';
// import { revalidatePath } from 'next/cache';

// // ── Create Task ───────────────────────────────────────────────
// export async function createTask(formData: {
//   title: string;
//   description?: string;
//   priority?: 'low' | 'medium' | 'high';
//   projectId: string;
//   assigneeId?: string;
//   dueDate?: string;
// }) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) throw new Error('Unauthorized');

//   await connectDB();

//   // Get highest order in 'todo' column so new task goes to bottom
//   const lastTask = await Task.findOne({
//     project: formData.projectId,
//     status:  'todo',
//   }).sort({ order: -1 });

//   const task = await Task.create({
//     title:       formData.title,
//     description: formData.description,
//     priority:    formData.priority ?? 'medium',
//     project:     formData.projectId,
//     assignee:    formData.assigneeId,
//     createdBy:   session.user.id,
//     dueDate:     formData.dueDate,
//     status:      'todo',
//     order:       (lastTask?.order ?? 0) + 1,
//   });

//   revalidatePath(`/projects/${formData.projectId}`);
//   return JSON.parse(JSON.stringify(task));
// }

// // ── Get All Tasks for a Project ───────────────────────────────
// export async function getTasksByProject(projectId: string) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) throw new Error('Unauthorized');

//   await connectDB();

//   const tasks = await Task.find({ project: projectId })
//     .populate('assignee',  'name image')
//     .populate('createdBy', 'name')
//     .sort({ status: 1, order: 1 });

//   return JSON.parse(JSON.stringify(tasks));
// }

// // ── Update Task Status (Kanban drag-and-drop) ─────────────────
// export async function updateTaskStatus(
//   taskId: string,
//   newStatus: TaskStatus,
//   newOrder: number
// ) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) throw new Error('Unauthorized');

//   await connectDB();

//   const task = await Task.findByIdAndUpdate(
//     taskId,
//     { status: newStatus, order: newOrder },
//     { new: true }
//   );

//   if (!task) throw new Error('Task not found');

//   revalidatePath(`/projects/${task.project}`);
//   return JSON.parse(JSON.stringify(task));
// }

// // ── Update Task Details ───────────────────────────────────────
// export async function updateTask(
//   taskId: string,
//   updates: {
//     title?: string;
//     description?: string;
//     priority?: 'low' | 'medium' | 'high';
//     assigneeId?: string;
//     dueDate?: string;
//   }
// ) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) throw new Error('Unauthorized');

//   await connectDB();

//   const task = await Task.findByIdAndUpdate(
//     taskId,
//     {
//       ...(updates.title       && { title:       updates.title }),
//       ...(updates.description && { description: updates.description }),
//       ...(updates.priority    && { priority:    updates.priority }),
//       ...(updates.assigneeId  && { assignee:    updates.assigneeId }),
//       ...(updates.dueDate     && { dueDate:     updates.dueDate }),
//     },
//     { new: true }
//   );

//   if (!task) throw new Error('Task not found');

//   revalidatePath(`/projects/${task.project}`);
//   return JSON.parse(JSON.stringify(task));
// }

// // ── Delete Task ───────────────────────────────────────────────
// export async function deleteTask(taskId: string, projectId: string) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   if (!session) throw new Error('Unauthorized');

//   await connectDB();

//   await Task.findByIdAndDelete(taskId);
//   revalidatePath(`/projects/${projectId}`);
// }
