"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

function assertAdmin(user: any) {
    if (!user || user.role !== "ADMIN") {
        throw new Error("Forbidden")
    }
}

export async function getPendingSuppliers() {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const admin = await prisma.user.findUnique({
        where: { clerkId: userId },
    })

    assertAdmin(admin)

    return prisma.user.findMany({
        where: {
            role: "SUPPLIER",
            status: "PENDING",
            deletedAt: null,
        },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            shopName: true,
            supplierType: true,
            address: true,
            gstNumber: true,
            createdAt: true,
        },
    })
}

export async function verifySupplier(
    supplierId: string,
    approve: boolean,
    notes?: string,
) {
    const { userId: adminClerkId } = await auth()
    if (!adminClerkId) throw new Error("Unauthorized")

    const admin = await prisma.user.findUnique({
        where: { clerkId: adminClerkId },
    })

    assertAdmin(admin)

    await prisma.user.update({
        where: { id: supplierId },
        data: {
            status: approve ? "APPROVED" : "REJECTED",
            verifiedAt: new Date(),
            verifiedByAdminId: admin?.id,
            verificationNotes: notes ?? null,
        },
    })

    return { success: true }
}
