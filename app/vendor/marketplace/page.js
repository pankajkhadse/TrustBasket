"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ShoppingCart, Star, MapPin, Phone, Plus, Minus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import VendorNavbar from "@/components/vendor-navbar"

export default function VendorMarketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [orderNotes, setOrderNotes] = useState("")

  // Mock marketplace data - in real app, this would come from API
  const [marketplaceItems] = useState([
    {
      id: 1,
      name: "Fresh Tomatoes",
      price: 40,
      quantity: 100,
      unit: "kg",
      supplier: {
        name: "Fresh Veggies Co.",
        rating: 4.9,
        location: "Connaught Place, Delhi",
        phone: "+91 98765 43210",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Fresh red tomatoes, perfect for cooking",
      image: "/placeholder.svg?height=200&width=200",
      category: "vegetables",
      status: "Listed",
      dateAdded: "2024-01-15",
    },
    {
      id: 2,
      name: "Green Chilies",
      price: 80,
      quantity: 50,
      unit: "kg",
      supplier: {
        name: "Fresh Veggies Co.",
        rating: 4.9,
        location: "Connaught Place, Delhi",
        phone: "+91 98765 43210",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Spicy green chilies, fresh from farm",
      image: "/placeholder.svg?height=200&width=200",
      category: "vegetables",
      status: "Listed",
      dateAdded: "2024-01-13",
    },
    {
      id: 3,
      name: "Basmati Rice",
      price: 120,
      quantity: 200,
      unit: "kg",
      supplier: {
        name: "Grain Masters",
        rating: 4.7,
        location: "Chandni Chowk, Delhi",
        phone: "+91 98765 43211",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Premium quality basmati rice",
      image: "/placeholder.svg?height=200&width=200",
      category: "grains",
      status: "Listed",
      dateAdded: "2024-01-12",
    },
    {
      id: 4,
      name: "Fresh Milk",
      price: 60,
      quantity: 100,
      unit: "litre",
      supplier: {
        name: "Dairy Fresh",
        rating: 4.8,
        location: "Noida Sector 18",
        phone: "+91 98765 43212",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Pure cow milk, delivered fresh daily",
      image: "/placeholder.svg?height=200&width=200",
      category: "dairy",
      status: "Listed",
      dateAdded: "2024-01-11",
    },
    {
      id: 5,
      name: "Garam Masala",
      price: 200,
      quantity: 25,
      unit: "kg",
      supplier: {
        name: "Spice Masters",
        rating: 4.8,
        location: "Chandni Chowk, Delhi",
        phone: "+91 98765 43213",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Authentic blend of Indian spices",
      image: "/placeholder.svg?height=200&width=200",
      category: "spices",
      status: "Listed",
      dateAdded: "2024-01-10",
    },
    {
      id: 6,
      name: "Fresh Paneer",
      price: 300,
      quantity: 30,
      unit: "kg",
      supplier: {
        name: "Dairy Fresh",
        rating: 4.8,
        location: "Noida Sector 18",
        phone: "+91 98765 43212",
        image: "/placeholder.svg?height=40&width=40",
      },
      description: "Soft and fresh paneer, made daily",
      image: "/placeholder.svg?height=200&width=200",
      category: "dairy",
      status: "Listed",
      dateAdded: "2024-01-09",
    },
  ])

  const filteredItems = marketplaceItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "low" && item.price <= 50) ||
      (priceFilter === "medium" && item.price > 50 && item.price <= 150) ||
      (priceFilter === "high" && item.price > 150)
    return matchesSearch && matchesCategory && matchesPrice
  })

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "vegetables", label: "Vegetables" },
    { value: "grains", label: "Grains" },
    { value: "dairy", label: "Dairy" },
    { value: "spices", label: "Spices" },
  ]

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "low", label: "Under ₹50" },
    { value: "medium", label: "₹50 - ₹150" },
    { value: "high", label: "Above ₹150" },
  ]

  const handleAddToCart = (item, quantity = 1) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id)
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, cartQuantity: cartItem.cartQuantity + quantity } : cartItem,
        ),
      )
    } else {
      setCart([...cart, { ...item, cartQuantity: quantity }])
    }
  }

  const handleUpdateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(itemId)
      return
    }
    setCart(cart.map((item) => (item.id === itemId ? { ...item, cartQuantity: newQuantity } : item)))
  }

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId))
  }

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0)
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.price * item.cartQuantity, 0)
  }

  const handlePlaceOrder = () => {
    // Group items by supplier
    const ordersBySupplier = cart.reduce((acc, item) => {
      const supplierId = item.supplier.name
      if (!acc[supplierId]) {
        acc[supplierId] = {
          supplier: item.supplier,
          items: [],
          totalAmount: 0,
        }
      }
      acc[supplierId].items.push({
        name: item.name,
        quantity: item.cartQuantity,
        unit: item.unit,
        price: item.price,
        total: item.price * item.cartQuantity,
      })
      acc[supplierId].totalAmount += item.price * item.cartQuantity
      return acc
    }, {})

    // In real app, this would send orders to backend
    console.log("Orders placed:", ordersBySupplier)
    console.log("Order notes:", orderNotes)

    // Clear cart and close dialogs
    setCart([])
    setOrderNotes("")
    setIsCheckoutOpen(false)
    setIsCartOpen(false)

    // Show success message (in real app, this would be a proper notification)
    alert("Orders placed successfully! Suppliers will be notified.")
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case "vegetables":
        return "🥬"
      case "grains":
        return "🌾"
      case "dairy":
        return "🥛"
      case "spices":
        return "🌶️"
      default:
        return "📦"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
              <p className="text-gray-600">Browse and order from verified suppliers</p>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="relative bg-transparent">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart ({getTotalCartItems()})
                    {getTotalCartItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                        {getTotalCartItems()}
                      </Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Shopping Cart</DialogTitle>
                    <DialogDescription>Review your items before placing the order</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8">
                        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cart.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell>
                                    <div className="flex items-center space-x-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.image || "/placeholder.svg"} alt={item.name} />
                                        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.supplier.name}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    ₹{item.price}/{item.unit}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateCartQuantity(item.id, item.cartQuantity - 1)}
                                        className="h-6 w-6 p-0 bg-transparent"
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center">{item.cartQuantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateCartQuantity(item.id, item.cartQuantity + 1)}
                                        className="h-6 w-6 p-0 bg-transparent"
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>₹{(item.price * item.cartQuantity).toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleRemoveFromCart(item.id)}
                                      className="text-red-600 hover:text-red-700 bg-transparent"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-lg font-medium">Total: ₹{getTotalCartValue().toLocaleString()}</span>
                            <div className="space-x-2">
                              <Button variant="outline" onClick={() => setCart([])} className="bg-transparent">
                                Clear Cart
                              </Button>
                              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                                <DialogTrigger asChild>
                                  <Button className="bg-green-600 hover:bg-green-700">Place Order</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                  <DialogHeader>
                                    <DialogTitle>Confirm Order</DialogTitle>
                                    <DialogDescription>
                                      Review your order details and add any special notes
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Order Summary</h4>
                                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                        {cart.map((item) => (
                                          <div key={item.id} className="flex justify-between text-sm">
                                            <span>
                                              {item.name} ({item.cartQuantity} {item.unit})
                                            </span>
                                            <span>₹{(item.price * item.cartQuantity).toLocaleString()}</span>
                                          </div>
                                        ))}
                                        <div className="border-t pt-2 font-medium">
                                          <div className="flex justify-between">
                                            <span>Total</span>
                                            <span>₹{getTotalCartValue().toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                                      <Textarea
                                        id="notes"
                                        value={orderNotes}
                                        onChange={(e) => setOrderNotes(e.target.value)}
                                        placeholder="Any special instructions for the suppliers..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
                                        Cancel
                                      </Button>
                                      <Button className="bg-green-600 hover:bg-green-700" onClick={handlePlaceOrder}>
                                        Confirm Order
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Items</p>
                  <p className="text-2xl font-bold text-gray-900">{marketplaceItems.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(marketplaceItems.map((item) => item.supplier.name)).size}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{categories.length - 1}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Filter className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold text-gray-900">{getTotalCartItems()}</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search items or suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Marketplace Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-white text-gray-800">
                      {getCategoryIcon(item.category)} {item.category}
                    </Badge>
                    <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                      {item.quantity} {item.unit} available
                    </Badge>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{item.price}</p>
                        <p className="text-sm text-gray-500">per {item.unit}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                    {/* Supplier Info */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.supplier.image || "/placeholder.svg"} alt={item.supplier.name} />
                        <AvatarFallback>{item.supplier.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.supplier.name}</p>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">{item.supplier.rating}</span>
                          <span className="text-xs text-gray-500 ml-2">{item.supplier.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedItem(item)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>{selectedItem?.name}</DialogTitle>
                            <DialogDescription>Product details and supplier information</DialogDescription>
                          </DialogHeader>
                          {selectedItem && (
                            <div className="space-y-4">
                              <img
                                src={selectedItem.image || "/placeholder.svg"}
                                alt={selectedItem.name}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Price</p>
                                  <p className="text-lg font-bold text-green-600">
                                    ₹{selectedItem.price} per {selectedItem.unit}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">Available</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {selectedItem.quantity} {selectedItem.unit}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                                <p className="text-gray-700">{selectedItem.description}</p>
                              </div>
                              <div className="border-t pt-4">
                                <p className="text-sm font-medium text-gray-600 mb-2">Supplier Information</p>
                                <div className="flex items-center space-x-3">
                                  <Avatar>
                                    <AvatarImage
                                      src={selectedItem.supplier.image || "/placeholder.svg"}
                                      alt={selectedItem.supplier.name}
                                    />
                                    <AvatarFallback>{selectedItem.supplier.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-gray-900">{selectedItem.supplier.name}</p>
                                    <div className="flex items-center">
                                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                      <span className="text-sm text-gray-600 ml-1">{selectedItem.supplier.rating}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">{selectedItem.supplier.location}</p>
                                  </div>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                  <Button variant="outline" className="flex-1 bg-transparent">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Supplier
                                  </Button>
                                  <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAddToCart(selectedItem)}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAddToCart(item)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
