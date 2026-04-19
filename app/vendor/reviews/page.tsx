import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getVendorReviews } from "@/lib/reviews/vendor"
import VendorReviewsClient from "./reviews-client"


export default async function VendorReviewsPage() {
    const { userId } = await auth()
    if (!userId) redirect("/login")
    return <VendorReviewsClient />
}
