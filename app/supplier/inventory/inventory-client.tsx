"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "@/lib/inventory/supplier"

import SupplierNavbar from "@/components/supplier-navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SupplierInventoryClient({ inventory }: any) {
  const [items, setItems] = useState(inventory)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const [form, setForm] = useState({
    name: "",
    description: "",
    unit: "kg",
    pricePerUnit: "",
    stockAvailable: "",
  })

  const submit = async () => {
    try {
      if (editing) {
        const updated = await updateMaterial(editing.id, editing.supplierId, {
          ...form,
          pricePerUnit: Number(form.pricePerUnit),
          stockAvailable: Number(form.stockAvailable),
        })
        setItems(items.map((i: any) => (i.id === updated.id ? updated : i)))
        toast.success("Item updated")
      } else {
        const created = await createMaterial(editing?.supplierId, {
          ...form,
          pricePerUnit: Number(form.pricePerUnit),
          stockAvailable: Number(form.stockAvailable),
        })
        setItems([created, ...items])
        toast.success("Item added")
      }
      setOpen(false)
      setEditing(null)
    } catch {
      toast.error("Failed to save item")
    }
  }

  const remove = async (id: string) => {
    await deleteMaterial(id, inventory[0].supplierId)
    setItems(items.filter((i: any) => i.id !== id))
    toast.success("Item deleted")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierNavbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="grid gap-4">
          {items.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex justify-between">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.stockAvailable} {item.unit} · ₹{item.pricePerUnit}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(item)
                      setForm(item)
                      setOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                placeholder="Price"
                type="number"
                value={form.pricePerUnit}
                onChange={(e) =>
                  setForm({ ...form, pricePerUnit: e.target.value })
                }
              />
              <Input
                placeholder="Stock"
                type="number"
                value={form.stockAvailable}
                onChange={(e) =>
                  setForm({ ...form, stockAvailable: e.target.value })
                }
              />
              <Button onClick={submit} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
