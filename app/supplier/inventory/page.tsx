import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSupplierInventory } from "@/lib/inventory/supplier"
import SupplierInventoryClient from "./inventory-client"


export default async function SupplierInventoryPage() {
  const { userId } =await auth()
  if (!userId) redirect("/login")

  const inventory = await getSupplierInventory(userId)

  return <SupplierInventoryClient inventory={inventory} />
}
