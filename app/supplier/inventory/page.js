"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, ShoppingCart, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SupplierNavbar from "@/components/supplier-navbar"

export default function SupplierInventory() {
  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: "Fresh Tomatoes",
      quantity: 100,
      unit: "kg",
      price: 40,
      description: "Fresh red tomatoes, perfect for cooking",
      image: "/placeholder.svg?height=100&width=100",
      status: "Listed",
      dateAdded: "2024-01-15",
    },
    {
      id: 2,
      name: "Organic Onions",
      quantity: 200,
      unit: "kg",
      price: 25,
      description: "Organic white onions, locally sourced",
      image: "/placeholder.svg?height=100&width=100",
      status: "Not Listed",
      dateAdded: "2024-01-14",
    },
    {
      id: 3,
      name: "Green Chilies",
      quantity: 50,
      unit: "kg",
      price: 80,
      description: "Spicy green chilies, fresh from farm",
      image: "/placeholder.svg?height=100&width=100",
      status: "Listed",
      dateAdded: "2024-01-13",
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    price: "",
    description: "",
    image: null,
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    const newItem = {
      id: inventory.length + 1,
      ...formData,
      quantity: Number.parseInt(formData.quantity),
      price: Number.parseFloat(formData.price),
      status: "Not Listed",
      dateAdded: new Date().toISOString().split("T")[0],
      image: formData.image || "/placeholder.svg?height=100&width=100",
    }
    setInventory([...inventory, newItem])
    setFormData({
      name: "",
      quantity: "",
      unit: "kg",
      price: "",
      description: "",
      image: null,
    })
    setIsAddDialogOpen(false)
  }

  const handleEditItem = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      description: item.description,
      image: item.image,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateItem = (e) => {
    e.preventDefault()
    const updatedInventory = inventory.map((item) =>
      item.id === editingItem.id
        ? {
            ...item,
            ...formData,
            quantity: Number.parseInt(formData.quantity),
            price: Number.parseFloat(formData.price),
          }
        : item,
    )
    setInventory(updatedInventory)
    setIsEditDialogOpen(false)
    setEditingItem(null)
    setFormData({
      name: "",
      quantity: "",
      unit: "kg",
      price: "",
      description: "",
      image: null,
    })
  }

  const handleDeleteItem = (id) => {
    setInventory(inventory.filter((item) => item.id !== id))
  }

  const handleToggleMarketplace = (id) => {
    const updatedInventory = inventory.map((item) =>
      item.id === id ? { ...item, status: item.status === "Listed" ? "Not Listed" : "Listed" } : item,
    )
    setInventory(updatedInventory)
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    return status === "Listed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const stats = {
    totalItems: inventory.length,
    listedItems: inventory.filter((item) => item.status === "Listed").length,
    totalValue: inventory.reduce((sum, item) => sum + item.quantity * item.price, 0),
    lowStock: inventory.filter((item) => item.quantity < 50).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage your vegetable inventory and marketplace listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
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
                  <p className="text-sm font-medium text-gray-600">Listed Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.listedItems}</p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Plus className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <ShoppingCart className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search vegetables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="Listed">Listed</SelectItem>
                <SelectItem value="Not Listed">Not Listed</SelectItem>
              </SelectContent>
            </Select>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Vegetable</DialogTitle>
                  <DialogDescription>Add a new item to your inventory.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Vegetable Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Tomatoes"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="100"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">Unit *</Label>
                      <Select
                        value={formData.unit}
                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                          <SelectItem value="litre">Litre</SelectItem>
                          <SelectItem value="piece">Piece</SelectItem>
                          <SelectItem value="dozen">Dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="price">Price per Unit (₹) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="40.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief description of the vegetable..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image (Optional)</Label>
                    <div className="mt-1">
                      <input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Add Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items ({filteredInventory.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={item.image || "/placeholder.svg"} alt={item.name} />
                            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${item.quantity < 50 ? "text-red-600" : "text-gray-900"}`}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>₹{item.price}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditItem(item)}
                            className="bg-transparent"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleToggleMarketplace(item.id)}
                            className={
                              item.status === "Listed"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }
                          >
                            {item.status === "Listed" ? "Unlist" : "List"}
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Vegetable</DialogTitle>
              <DialogDescription>Update the details of your inventory item.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Vegetable Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity *</Label>
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="litre">Litre</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="dozen">Dozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-price">Price per Unit (₹) *</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="40.00"
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the vegetable..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Update Item
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
