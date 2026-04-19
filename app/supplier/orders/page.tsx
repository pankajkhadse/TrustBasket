import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSupplierOrders } from "@/lib/orders/supplier"
import SupplierOrdersClient from "./orders-client"


export default async function SupplierOrdersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const orders = await getSupplierOrders(userId)

  return <SupplierOrdersClient orders={orders} />
}
