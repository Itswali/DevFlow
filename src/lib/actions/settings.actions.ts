'use server';

import connectDB  from '@/lib/db';
import { auth }   from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import mongoose   from 'mongoose';

// ── Update name ───────────────────────────────────────────────
export async function updateProfile(data: {
  firstName: string;
  lastName:  string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();
  const db   = mongoose.connection.db!;
  const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();

  // Better-Auth stores users with string `id` field (not ObjectId `_id`)
  const result = await db.collection('user').updateOne(
    { id: session.user.id },       // ← string id field used by Better-Auth
    { $set: { name } }
  );

  // Fallback: try by ObjectId _id if string id didn't match
  if (result.matchedCount === 0) {
    await db.collection('user').updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $set: { name } }
    );
  }

  revalidatePath('/settings');
  revalidatePath('/team');
  return { name };
}

// ── Update avatar image URL ───────────────────────────────────
export async function updateProfileImage(imageUrl: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('Unauthorized');

  await connectDB();
  const db = mongoose.connection.db!;

  const result = await db.collection('user').updateOne(
    { id: session.user.id },
    { $set: { image: imageUrl } }
  );

  if (result.matchedCount === 0) {
    await db.collection('user').updateOne(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $set: { image: imageUrl } }
    );
  }

  revalidatePath('/settings');
  revalidatePath('/team');
  return { image: imageUrl };
}
