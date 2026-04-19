import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getVendorMarketplace } from "@/lib/marketplace/vendor"
import VendorMarketplaceClient from "./marketplace-client"


export default async function VendorMarketplacePage() {
  const { userId } =await auth()
  if (!userId) redirect("/login")

  const materials = await getVendorMarketplace()

  return <VendorMarketplaceClient materials={materials} />
}
