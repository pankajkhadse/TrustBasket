import { prisma } from "@/lib/prisma"

type CartItem = {
  materialId: string
  supplierId: string
  quantity: number
  price: number
}

export async function placeVendorOrder(
  vendorId: string,
  items: CartItem[],
  notes?: string
) {
  const ordersBySupplier = items.reduce<Record<string, CartItem[]>>(
    (acc, item) => {
      acc[item.supplierId] = acc[item.supplierId] || []
      acc[item.supplierId].push(item)
      return acc
    },
    {}
  )

  for (const supplierId of Object.keys(ordersBySupplier)) {
    const supplierItems = ordersBySupplier[supplierId]

    const totalAmount = supplierItems.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    )

    await prisma.order.create({
      data: {
        buyerId: vendorId,
        supplierId,
        totalAmount,
        deliveryAddress: "Vendor Pickup",
        items: {
          create: supplierItems.map((i) => ({
            materialId: i.materialId,
            quantity: i.quantity,
            priceAtPurchase: i.price,
          })),
        },
      },
    })
  }
}

export async function getVendorOrders(vendorId: string) {
  return prisma.order.findMany({
    where: {
      buyerId: vendorId,
    },
    include: {
      supplier: {
        select: {
          id: true,
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
