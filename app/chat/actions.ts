"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function getChatByOrder(orderId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  return prisma.chat.findUnique({
    where: { orderId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
      vendor: true,
      supplier: true,
    },
  })
}

export async function sendMessage(chatId: string, text: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  return prisma.message.create({
    data: {
      chatId,
      senderId: userId,
      text,
    },
  })
}

export async function markMessagesRead(chatId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  await prisma.message.updateMany({
    where: {
      chatId,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  })
}
