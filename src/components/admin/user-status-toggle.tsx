'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

interface UserStatusToggleProps {
  userId: string
  currentStatus: string
}

export function UserStatusToggle({ userId, currentStatus }: UserStatusToggleProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleStatusToggle = async () => {
    try {
      setIsUpdating(true)
      
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user status')
      }

      toast.success(`User ${newStatus.toLowerCase()} successfully`)
      router.refresh()
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update user status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleStatusToggle}
      disabled={isUpdating}
      className="flex items-center space-x-2 rounded-sm px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 w-full text-left"
    >
      {currentStatus === 'ACTIVE' ? (
        <>
          <UserX className="h-4 w-4" />
          <span>{isUpdating ? 'Suspending...' : 'Suspend User'}</span>
        </>
      ) : (
        <>
          <UserCheck className="h-4 w-4" />
          <span>{isUpdating ? 'Activating...' : 'Activate User'}</span>
        </>
      )}
    </button>
  )
}