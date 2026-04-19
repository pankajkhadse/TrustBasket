import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getSupplierDashboardData } from "@/lib/dashboard/supplier"
import SupplierDashboardClient from "./supplier-dashboard-client"


export default async function SupplierDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const data = await getSupplierDashboardData(userId)

  return <SupplierDashboardClient data={data} />
}
