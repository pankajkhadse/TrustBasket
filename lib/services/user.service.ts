import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

export async function requireApprovedSupplier() {
  const user = await getCurrentUser();

  if (user.role !== "SUPPLIER") {
    throw new Error("Forbidden");
  }

  if (user.status !== "APPROVED") {
    throw new Error("Supplier not approved");
  }

  return user;
}
