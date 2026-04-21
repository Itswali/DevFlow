'use server';

import connectDB  from '@/lib/db';
import Project from '@/models/Project';
import { auth } from '@/lib/auth/auth';
import '@/models/User';
import User from '@/models/User';
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
export async function addMemberToProject(projectId: string, email: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
  if (!userToAdd) throw new Error('No user found with that email');

  const project = await Project.findById(projectId)
    .populate('owner', 'email'); // 👈 populate owner so we can check email
  if (!project) throw new Error('Project not found');

  // Compare by session email instead of ID
  const ownerEmail = (project.owner as any).email;
  if (ownerEmail !== session.user.email) {
    throw new Error('Only the project owner can add members');
  }

  const alreadyMember = project.members.some(
    (m: any) => m.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) throw new Error('User is already a member');

  project.members.push(userToAdd._id);
  await project.save();

  revalidatePath(`/projects/${projectId}`);
  return JSON.parse(JSON.stringify(userToAdd));
}

// ── Remove Member ─────────────────────────────────────────────
export async function removeMemberFromProject(
  projectId: string,
  memberId:  string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const project = await Project.findById(projectId)
    .populate('owner', 'email'); // 👈 populate owner
  if (!project) throw new Error('Project not found');

  // Compare by session email
  const ownerEmail = (project.owner as any).email;
  if (ownerEmail !== session.user.email) {
    throw new Error('Only the project owner can remove members');
  }

  if ((project.owner as any)._id.toString() === memberId) {
    throw new Error('Cannot remove the project owner');
  }

  project.members = project.members.filter(
    (m: any) => m.toString() !== memberId
  );
  await project.save();

  revalidatePath(`/projects/${projectId}`);
}
