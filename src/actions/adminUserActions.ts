'use server'

import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'

async function checkAdminOnly() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    throw new Error('Not authorized')
  }

  return session.user.id
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const currentUserId = await checkAdminOnly()

    if (userId === currentUserId) {
      return { success: false, message: 'You cannot change your own role' }
    }

    if (!Object.values(UserRole).includes(newRole)) {
      return { success: false, message: 'Invalid role' }
    }

    const user = await prisma.users.findUnique({ where: { id: userId } })
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    await prisma.users.update({
      where: { id: userId },
      data: { role: newRole },
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: `Role updated to ${newRole}`,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to update role',
    }
  }
}

export async function toggleUserActive(userId: string) {
  try {
    const currentUserId = await checkAdminOnly()

    if (userId === currentUserId) {
      return { success: false, message: 'You cannot deactivate yourself' }
    }

    const user = await prisma.users.findUnique({ where: { id: userId } })
    if (!user) {
      return { success: false, message: 'User not found' }
    }

    const updated = await prisma.users.update({
      where: { id: userId },
      data: { is_active: !user.is_active },
    })

    revalidatePath('/admin')

    return {
      success: true,
      message: updated.is_active ? 'User activated' : 'User deactivated',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to toggle user status',
    }
  }
}
