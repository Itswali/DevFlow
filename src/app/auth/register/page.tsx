import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'


export default function page() {
  return (
    <div>

<h1>This is the sign up page</h1>
<br /><hr />
          <Button asChild>
            <Link href="/">Back</Link>
          </Button>
    </div>
  )
}
