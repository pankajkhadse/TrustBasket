"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getSupplierProfile() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  return prisma.user.findUnique({
    where: { clerkId: userId },
  })
}

export async function updateSupplierProfile(data: {
  shopName?: string
  address?: string
  lat?: number
  lng?: number
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  return prisma.user.update({
    where: { clerkId: userId },
    data,
  })
}
