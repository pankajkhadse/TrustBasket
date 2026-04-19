"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function getSupplierGroupOrders() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const supplier = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!supplier) return []

  return prisma.groupOrder.findMany({
    where: {
      supplierId: supplier.id,
    },
    include: {
      vendor: { select: { name: true } },
      material: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function closeGroupOrder(id: string) {
  await prisma.groupOrder.update({
    where: { id },
    data: { status: "CLOSED" },
  })

  revalidatePath("/supplier/group-orders")
}
