"use client"

import { useState } from "react"
import { Bell, Search, Menu, User, Settings, LogOut, Package, Users, Truck, BarChart3 } from "lucide-react"
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
import Link from "next/link"

export default function SupplierNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { name: "Dashboard", href: "/supplier/dashboard", icon: BarChart3 },
    { name: "Orders", href: "/supplier/orders", icon: Package },
    { name: "Inventory", href: "/supplier/inventory", icon: Package },
    { name: "Vendors", href: "/supplier/vendors", icon: Users },
    { name: "Deliveries", href: "/supplier/deliveries", icon: Truck },
  ]

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/supplier/dashboard" className="flex items-center">
              <h1 className="text-2xl font-bold text-green-600">Trust Basket</h1>
              <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-800">
                Supplier
              </Badge>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="text" placeholder="Search orders, vendors..." className="pl-10 pr-4 w-full" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    4
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-2 p-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium">New order received</p>
                    <p className="text-xs text-gray-600">Order #ORD-005 from Delhi Street Kitchen</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium">Payment received</p>
                    <p className="text-xs text-gray-600">₹2,450 for order #ORD-001</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium">Low stock alert</p>
                    <p className="text-xs text-gray-600">Tomatoes running low - 50kg remaining</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium">Delivery scheduled</p>
                    <p className="text-xs text-gray-600">Order #ORD-003 pickup at 2 PM</p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Supplier" />
                    <AvatarFallback>FV</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Fresh Veggies Co.</p>
                    <p className="text-xs leading-none text-muted-foreground">supplier@freshveggies.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold">Supplier Menu</h2>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input type="text" placeholder="Search..." className="pl-10 pr-4 w-full" />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-3 rounded-md text-sm font-medium transition-colors"
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
