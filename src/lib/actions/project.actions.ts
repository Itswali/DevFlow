'use server';

import connectDB         from '@/lib/db';
import Project           from '@/models/Project';
import { auth }          from '@/lib/auth/auth';
import { headers }       from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose          from 'mongoose';

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
    members:     [session.user.id],
  });

  revalidatePath('/dashboard');
  return JSON.parse(JSON.stringify(project));
}

// ── Get All Projects for Current User ─────────────────────────
export async function getProjects() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const projects = await Project.find({ members: session.user.id })
    .sort({ createdAt: -1 });

  if (!projects.length) return [];

  // Manually fetch member details from Better-Auth collection
  const db       = mongoose.connection.db!;
  const allMemberIds = [...new Set(
    projects.flatMap((p) => [
      p.owner.toString(),
      ...p.members.map((m: any) => m.toString()),
    ])
  )];

  const users = await db.collection('user').find({
    _id: { $in: allMemberIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).toArray();

  const userMap = Object.fromEntries(
    users.map((u) => [u._id.toString(), {
      _id:   u._id.toString(),
      name:  u.name,
      email: u.email,
      image: u.image ?? null,
    }])
  );

  const serialized = projects.map((p) => ({
    _id:         p._id.toString(),
    name:        p.name,
    description: p.description,
    owner:       userMap[p.owner.toString()] ?? { _id: p.owner.toString(), name: 'Unknown', email: '' },
    members:     p.members.map((m: any) => userMap[m.toString()] ?? { _id: m.toString(), name: 'Unknown', email: '' }),
    createdAt:   p.createdAt,
    updatedAt:   p.updatedAt,
  }));

  return JSON.parse(JSON.stringify(serialized));
}

// ── Get Single Project ─────────────────────────────────────────
export async function getProjectById(projectId: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error('Unauthorized');

    await connectDB();

    if (projectId.length !== 24) return null;

    const project = await Project.findById(projectId);
    if (!project) return null;

    // Fetch all user details from Better-Auth collection
    const db = mongoose.connection.db!;
    const allIds = [...new Set([
      project.owner.toString(),
      ...project.members.map((m: any) => m.toString()),
    ])];

    const users = await db.collection('user').find({
      _id: { $in: allIds.map((id) => new mongoose.Types.ObjectId(id)) },
    }).toArray();

    const userMap = Object.fromEntries(
      users.map((u) => [u._id.toString(), {
        _id:   u._id.toString(),
        name:  u.name,
        email: u.email,
        image: u.image ?? null,
      }])
    );

    return JSON.parse(JSON.stringify({
      _id:         project._id.toString(),
      name:        project.name,
      description: project.description,
      owner:       userMap[project.owner.toString()] ?? { _id: project.owner.toString(), name: 'Unknown', email: '' },
      members:     project.members.map((m: any) => userMap[m.toString()] ?? { _id: m.toString(), name: 'Unknown', email: '' }),
      createdAt:   project.createdAt,
      updatedAt:   project.updatedAt,
    }));
  } catch (error) {
    console.error('Error in getProjectById:', error);
    return null;
  }
}

// ── Delete Project ─────────────────────────────────────────────
export async function deleteProject(projectId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  if (project.owner.toString() !== session.user.id) {
    throw new Error('Forbidden');
  }

  await Project.findByIdAndDelete(projectId);
  revalidatePath('/dashboard');
}

// ── Add Member ─────────────────────────────────────────────────
export async function addMemberToProject(projectId: string, email: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const db = mongoose.connection.db!;

  // Find user to add from Better-Auth collection
  const userToAdd = await db.collection('user').findOne({
    email: email.toLowerCase().trim(),
  });
  if (!userToAdd) throw new Error('No user found with that email');

  // Get project (no populate)
  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  // Check ownership using session.user.id directly
  if (project.owner.toString() !== session.user.id) {
    throw new Error('Only the project owner can add members');
  }

  // Already a member?
  const alreadyMember = project.members.some(
    (m: any) => m.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) throw new Error('User is already a member');

  project.members.push(userToAdd._id);
  await project.save();

  revalidatePath(`/projects/${projectId}`);

  return JSON.parse(JSON.stringify({
    _id:   userToAdd._id.toString(),
    name:  userToAdd.name,
    email: userToAdd.email,
    image: userToAdd.image ?? null,
  }));
}

// ── Remove Member ──────────────────────────────────────────────
export async function removeMemberFromProject(
  projectId: string,
  memberId:  string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();

  const project = await Project.findById(projectId);
  if (!project) throw new Error('Project not found');

  if (project.owner.toString() !== session.user.id) {
    throw new Error('Only the project owner can remove members');
  }

  if (project.owner.toString() === memberId) {
    throw new Error('Cannot remove the project owner');
  }

  project.members = project.members.filter(
    (m: any) => m.toString() !== memberId
  );
  await project.save();

  revalidatePath(`/projects/${projectId}`);
}
