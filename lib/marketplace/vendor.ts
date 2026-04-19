import { prisma } from "@/lib/prisma"

export async function getVendorMarketplace() {
  return prisma.material.findMany({
    where: {
      supplier: {
        status: "APPROVED",
        isBlocked: false,
      },
      stockAvailable: {
        gt: 0,
      },
    },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          ratingStars: true,
          address: true,
          phone: true,
          shopImgUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}
