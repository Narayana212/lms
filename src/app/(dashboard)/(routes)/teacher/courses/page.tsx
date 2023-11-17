import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export default function page() {
  return (
    <div>
      <Link href="/teachers/create" className={buttonVariants()}>
        Create Course
      </Link>
    </div>
  )
}
