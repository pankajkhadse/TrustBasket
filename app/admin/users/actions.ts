"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

function assertAdmin(user: any) {
  if (!user || user.role !== "ADMIN") {
    throw new Error("Forbidden")
  }
}

export async function getAllUsers() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const admin = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  assertAdmin(admin)

  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      isBlocked: true,
      blockedReason: true,
      createdAt: true,
    },
  })
}

export async function toggleUserBlock(
  userId: string,
  block: boolean,
  reason?: string,
) {
  const { userId: adminClerkId } = await auth()
  if (!adminClerkId) throw new Error("Unauthorized")

  const admin = await prisma.user.findUnique({
    where: { clerkId: adminClerkId },
  })

  assertAdmin(admin)

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBlocked: block,
      blockedReason: block ? reason : null,
    },
  })

  return { success: true }
}
