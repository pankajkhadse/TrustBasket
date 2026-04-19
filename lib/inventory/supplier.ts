import { prisma } from "@/lib/prisma"

/* ---------- FETCH INVENTORY ---------- */
export async function getSupplierInventory(supplierId: string) {
  return prisma.material.findMany({
    where: {
      supplierId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

/* ---------- CREATE MATERIAL ---------- */
export async function createMaterial(
  supplierId: string,
  data: {
    name: string
    description?: string
    pricePerUnit: number
    unit: string
    stockAvailable: number
    imageUrl?: string
  }
) {
  return prisma.material.create({
    data: {
      supplierId,
      name: data.name,
      description: data.description,
      pricePerUnit: data.pricePerUnit,
      unit: data.unit,
      stockAvailable: data.stockAvailable,
      imageUrl: data.imageUrl,
    },
  })
}

/* ---------- UPDATE MATERIAL ---------- */
export async function updateMaterial(
  id: string,
  supplierId: string,
  data: {
    name: string
    description?: string
    pricePerUnit: number
    unit: string
    stockAvailable: number
  }
) {
  return prisma.material.update({
    where: {
      id,
      supplierId,
    },
    data,
  })
}

/* ---------- DELETE MATERIAL ---------- */
export async function deleteMaterial(id: string, supplierId: string) {
  return prisma.material.delete({
    where: {
      id,
      supplierId,
    },
  })
}
