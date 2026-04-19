import { prisma } from "@/lib/prisma"
import { OrderStatus } from "@prisma/client"

/* ---------- FETCH SUPPLIER ORDERS ---------- */
export async function getSupplierOrders(supplierId: string) {
  return prisma.order.findMany({
    where: {
      supplierId,
    },
    include: {
      buyer: {
        select: {
          name: true,
          phone: true,
          address: true,
        },
      },
      items: {
        include: {
          material: {
            select: {
              name: true,
              unit: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

/* ---------- ACCEPT ORDER ---------- */
export async function acceptOrder(orderId: string, supplierId: string) {
  return prisma.order.update({
    where: {
      id: orderId,
      supplierId,
    },
    data: {
      status: OrderStatus.ACCEPTED,
    },
  })
}

/* ---------- REJECT ORDER ---------- */
export async function rejectOrder(
  orderId: string,
  supplierId: string,
  reason: string
) {
  return prisma.order.update({
    where: {
      id: orderId,
      supplierId,
    },
    data: {
      status: OrderStatus.CANCELLED,
    },
  })
}
