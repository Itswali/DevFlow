'use server';

import connectDB  from '@/lib/db';
import Project from '@/models/Project';
import { auth } from '@/lib/auth/auth';
import '@/models/User';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ── Create Project ────────────────────────────────────────────
export async function createProject(formData: {
  name: string;
  description?: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const project = await Project.create({
    name:        formData.name,
    description: formData.description,
    owner:       session.user.id,
    members:     [session.user.id], // creator is auto-added as member
  });

  revalidatePath('/dashboard');
  return JSON.parse(JSON.stringify(project)); // serialize mongoose doc
}

// ── Get All Projects for Current User ────────────────────────
export async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const projects = await Project.find({
    members: session.user.id,
  })
    .populate('owner', 'name email image')
    .sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(projects));
}

// ── Get Single Project ────────────────────────────────────────
export async function getProjectById(projectId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    await connectDB();

    // 1. Validate the ID format to prevent Mongoose "CastError"
    if (projectId.length !== 24) return null;

    const project = await Project.findById(projectId)
      .populate('owner',   'name email image')
      .populate('members', 'name email image');

    // 2. Return null instead of throwing
    if (!project) return null;

    return JSON.parse(JSON.stringify(project));
  } catch (error) {
    console.error("Error in getProjectById:", error);
    return null; // Return null so the UI can call notFound()
  }
}

// ── Delete Project (admin/owner only) ────────────────────────
export async function deleteProject(projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  // Only the owner can delete
  if (project.owner.toString() !== session.user.id) {
    throw new Error('Forbidden');
  }

  await Project.findByIdAndDelete(projectId);
  revalidatePath('/dashboard');
}
