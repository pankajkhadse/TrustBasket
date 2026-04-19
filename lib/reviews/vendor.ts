import { prisma } from "@/lib/prisma"

export async function getVendorReviews(vendorId: string) {
  return prisma.review.findMany({
    where: {
      reviewerId: vendorId,
    },
    include: {
      supplier: {
        select: {
          name: true,
        },
      },
      order: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export async function createReview(
  vendorId: string,
  supplierId: string,
  orderId: string,
  rating: number,
  comment?: string
) {
  await prisma.review.create({
    data: {
      reviewerId: vendorId,
      supplierId,
      orderId,
      rating,
      comment,
    },
  })

  // update supplier rating
  const stats = await prisma.review.aggregate({
    where: { supplierId },
    _avg: { rating: true },
    _count: true,
  })

  await prisma.user.update({
    where: { id: supplierId },
    data: {
      ratingStars: stats._avg.rating ?? 0,
      reviewCount: stats._count,
    },
  })
}
