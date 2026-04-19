"use server"

import { prisma } from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs/server"

type RegisterPayload = {
  name: string
  phone?: string
  email?: string
  role: "BUYER" | "SUPPLIER"
  address?: string
  lat?: number
  lng?: number
  supplierType?: "FARMER" | "VENDOR"
  shopName?: string
}

export async function registerUserInDB(payload: RegisterPayload) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  if (!payload.name || !payload.role) {
    throw new Error("Invalid payload: name and role are required")
  }

  const clerk = await clerkClient()

  // Get phone from Clerk if not explicitly provided
  let phone: string | null = null
  if (payload.phone && payload.phone.trim()) {
    phone = payload.phone.trim()
  } else {
    const clerkUser = await clerk.users.getUser(userId)
    const clerkPhone = clerkUser.phoneNumbers?.[0]?.phoneNumber
    phone = clerkPhone || null
  }

  // Use upsert to handle re-registration (e.g. user retries after a failed attempt)
  await prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      name: payload.name,
      phone: phone,
      email: payload.email || null,
      role: payload.role,
      address: payload.address || null,
      lat: payload.lat,
      lng: payload.lng,
      supplierType: payload.supplierType || null,
      shopName: payload.shopName || null,
      status: "PENDING",
    },
    create: {
      clerkId: userId,
      name: payload.name,
      phone: phone,
      email: payload.email || null,
      role: payload.role,
      address: payload.address || null,
      lat: payload.lat,
      lng: payload.lng,
      supplierType: payload.supplierType || null,
      shopName: payload.shopName || null,
      status: "PENDING",
    },
  })

  await clerk.users.updateUser(userId, {
    publicMetadata: {
      role: payload.role,
      onboarded: true,
      status: "PENDING",
      supplierType: payload.supplierType,
    },
  })

  return { success: true }
}
