"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function createGroupOrder(materialId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user || user.role !== "BUYER") {
    throw new Error("Only vendors can create group orders")
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
  })

  if (!material) throw new Error("Material not found")

  await prisma.groupOrder.create({
    data: {
      vendorId: user.id,
      supplierId: material.supplierId,
      materialId,
    },
  })

  revalidatePath("/vendor/group-orders")
}

export async function getVendorGroupOrders() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return []

  return prisma.groupOrder.findMany({
    where: {
      vendorId: user.id,
    },
    include: {
      material: true,
      supplier: {
        select: {
          name: true,
          phone: true,
          ratingStars: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
