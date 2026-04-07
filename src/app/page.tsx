// app/page.tsx
import React from 'react'
import connectionToDatabase from '@/lib/db'

export default async function Page() {
  // Call the connection inside the Server Component
  await connectionToDatabase();

  return (
    <div>
      <h1 className="font-bold">Welcome to DevFlow</h1>
    </div>
  )
}
