'use server';

import connectDB  from '@/lib/db';
import { auth }   from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose   from 'mongoose';

export async function updateProfile(data: { firstName: string; lastName: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();
  const db   = mongoose.connection.db!;
  const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

  await db.collection('user').updateOne(
    { id: session.user.id },
    { $set: { name } }
  );

  revalidatePath('/settings');
  return { name };
}
