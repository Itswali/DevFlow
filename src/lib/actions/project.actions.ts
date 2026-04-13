"use server"

import { connectDB } from '@/lib/db';
import Project from '@/models/Project';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Create Project

export async function createProject(formData: {
  name: string;
  description?: string;
}) {
  const session = await auth.api.getSession({headers: await headers()});
  if(!session) throw new Error("Unauthorized");

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


