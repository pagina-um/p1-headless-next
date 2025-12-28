'use client'

import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'

interface EditPostButtonProps {
  postId: string
}

export function EditPostButton({ postId }: EditPostButtonProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in via Payload API
    fetch('/api/users/me', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setIsLoggedIn(true)
        }
      })
      .catch(() => {
        // Not logged in
      })
  }, [])

  if (!isLoggedIn) {
    return null
  }

  return (
    <a
      href={`/admin/collections/posts/${postId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-colors"
      title="Edit this post"
    >
      <Pencil size={18} />
      <span className="hidden sm:inline">Edit</span>
    </a>
  )
}
