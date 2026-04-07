import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div>
      this is login <br />
          <Button asChild>
            <Link href="/">Back</Link>
          </Button>
    </div>
  )
}
