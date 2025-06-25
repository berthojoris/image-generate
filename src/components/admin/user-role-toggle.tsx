'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'

interface UserRoleToggleProps {
  userId: string
  currentRole: string
}

export function UserRoleToggle({ userId, currentRole }: UserRoleToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleRoleToggle = async () => {
    try {
      setIsUpdating(true)
      
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'
      
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user role')
      }

      toast.success(`User role updated to ${newRole}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user role')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleRoleToggle}
      disabled={isUpdating}
      className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left"
    >
      {currentRole === 'ADMIN' ? (
        <>
          <ShieldOff className="h-4 w-4" />
          <span>{isUpdating ? 'Removing Admin...' : 'Remove Admin'}</span>
        </>
      ) : (
        <>
          <Shield className="h-4 w-4" />
          <span>{isUpdating ? 'Making Admin...' : 'Make Admin'}</span>
        </>
      )}
    </button>
  )
}