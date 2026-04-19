import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

/* ---------------- ROUTE MATCHERS ---------------- */

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/register(.*)",
])

const isOnboardRoute = createRouteMatcher([
  "/onboard",
])

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
])

const isSupplierRoute = createRouteMatcher([
  "/supplier(.*)",
])

const isVendorRoute = createRouteMatcher([
  "/vendor(.*)",
])

/* ---------------- DASHBOARD BY ROLE ---------------- */

function getDashboard(role?: string, supplierType?: string) {
  if (role === "ADMIN") return "/admin/dashboard"
  if (role === "SUPPLIER" && supplierType === "VENDOR")
    return "/vendor/dashboard"
  if (role === "SUPPLIER") return "/supplier/dashboard"
  return "/"
}


/* ---------------- MIDDLEWARE ---------------- */

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  const url = req.nextUrl
  const pathname = url.pathname

  /* ---------- NOT LOGGED IN ---------- */
  if (!userId) {
    if (isPublicRoute(req)) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", url))
  }

  /* ---------- JWT CLAIMS (FROM TEMPLATE) ---------- */
  const role = sessionClaims?.role as
    | "ADMIN"
    | "SUPPLIER"
    | "VENDOR"
    | undefined

  const onboarded = sessionClaims?.onboarded === true
  const status = sessionClaims?.status as
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | undefined
  const supplierType = sessionClaims?.supplierType as string | undefined

  const dashboard = getDashboard(role, supplierType)

  /* ---------- NOT ONBOARDED ---------- */
  if (!onboarded) {
    if (isOnboardRoute(req)) return NextResponse.next()
    return NextResponse.redirect(new URL("/onboard", url))
  }

  /* ---------- ONBOARDED USER VISITING PUBLIC ROUTES ---------- */
  if (onboarded && isPublicRoute(req)) {
    if (pathname === dashboard) return NextResponse.next()
    return NextResponse.redirect(new URL(dashboard, url))
  }

  /* ---------- PENDING USERS (DASHBOARD ONLY) ---------- */
  if (status === "PENDING") {
    if (pathname === dashboard) return NextResponse.next()
    return NextResponse.redirect(new URL(dashboard, url))
  }

  /* ---------- APPROVED ROLE GUARDS ---------- */
  if (status === "APPROVED") {
    if (isAdminRoute(req) && role !== "ADMIN") {
      return NextResponse.redirect(new URL(dashboard, url))
    }

    if (isSupplierRoute(req) && (role !== "SUPPLIER" || supplierType === "VENDOR")) {
      return NextResponse.redirect(new URL(dashboard, url))
    }

    if (isVendorRoute(req) && (role !== "SUPPLIER" || supplierType !== "VENDOR")) {
      return NextResponse.redirect(new URL(dashboard, url))
    }
  }

  return NextResponse.next()
})

/* ---------------- MATCHER ---------------- */

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
