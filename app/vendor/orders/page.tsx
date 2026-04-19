import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getVendorOrders } from "@/lib/orders/vendor"
import VendorOrdersClient from "./orders-client"


export default async function VendorOrdersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const orders = await getVendorOrders(userId)

  return <VendorOrdersClient orders={orders} />
}
