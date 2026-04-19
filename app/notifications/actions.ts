"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getNotifications() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  return prisma.auditLog.findMany({
    where: {
      actorid: user?.id,
    },
    orderBy: { createdat: "desc" },
    take: 50,
  })
}
