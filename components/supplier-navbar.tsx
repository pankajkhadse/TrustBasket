"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"

import {
  Bell,
  Search,
  Menu,
  User,
  Settings,
  LogOut,
  Package,
  Users,
  Truck,
  BarChart3,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function SupplierNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const { user } = useUser()
  const { signOut } = useClerk()

  /* ---------------- NAV ITEMS ---------------- */

  const navItems = [
    { name: "Dashboard", href: "/supplier/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/supplier/orders", icon: Package },
    { name: "Inventory", href: "/supplier/inventory", icon: Package },
    { name: "Vendors", href: "/supplier/vendors", icon: Users },
    { name: "Deliveries", href: "/supplier/deliveries", icon: Truck },
  ]

  /* ---------------- MOCK NOTIFICATION COUNT (BACKEND READY) ---------------- */
  // Replace with API call later
  const notificationCount = 4

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* LOGO */}
          <Link href="/supplier/dashboard" className="flex items-center">
            <h1 className="text-2xl font-bold text-green-600">Vyapar Mitra</h1>
            <Badge className="ml-2 text-xs bg-orange-100 text-orange-800">
              Supplier
            </Badge>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "text-green-600 bg-green-50"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* SEARCH */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders, vendors..."
                className="pl-10"
              />
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-3">
            {/* NOTIFICATIONS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                      {notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-2 p-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-gray-600">
                      Order from Delhi Street Kitchen
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-gray-600">
                      Tomatoes below 50kg
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* USER MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || "Supplier"}
                    />
                    <AvatarFallback>
                      {user?.fullName?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/supplier/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/supplier/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* MOBILE MENU */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="space-y-2 mt-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center px-3 py-3 rounded-md text-sm font-medium hover:bg-green-50"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
