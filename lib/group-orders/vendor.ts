import { prisma } from "@/lib/prisma"

export async function getVendorGroupOrders(vendorId: string) {
  return prisma.groupOrder.findMany({
    where: {
      vendorId,
    },
    include: {
      material: {
        select: {
          name: true,
          unit: true,
        },
      },
      supplier: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
