"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

export async function getVendorOrdersForReview() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const vendor = await prisma.user.findUnique({
        where: { clerkId: userId },
    })

    if (!vendor) return []

    return prisma.order.findMany({
        where: {
            buyerId: vendor.id,
            status: "DELIVERED",
            reviews: { none: {} },
        },
        include: {
            supplier: true,
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function submitReview(
    orderId: string,
    supplierId: string,
    rating: number,
    comment?: string
) {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const vendor = await prisma.user.findUnique({
        where: { clerkId: userId },
    })

    if (!vendor) throw new Error("User not found")

    await prisma.review.create({
        data: {
            orderId,
            supplierId,
            reviewerId: vendor.id,
            rating,
            comment,
        },
    })

    // update supplier stats
    await prisma.user.update({
        where: { id: supplierId },
        data: {
            reviewCount: { increment: 1 },
            ratingStars: {
                increment: rating,
            },
        },
    })

    revalidatePath("/vendor/reviews")
}
