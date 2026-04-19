"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import AdminNavbar from "@/components/admin-navbar"
import { getPendingSuppliers, verifySupplier } from "./actions"

export default function AdminVerificationsPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    getPendingSuppliers().then(setSuppliers)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          Supplier Verifications
        </h1>

        {suppliers.length === 0 && (
          <p className="text-gray-500">No pending suppliers 🎉</p>
        )}

        <div className="space-y-6">
          {suppliers.map((s) => (
            <Card key={s.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {s.shopName || s.name}
                  <Badge className="bg-yellow-100 text-yellow-800">
                    PENDING
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <p><b>Owner:</b> {s.name}</p>
                  <p><b>Phone:</b> {s.phone}</p>
                  <p><b>Email:</b> {s.email || "-"}</p>
                  <p><b>Type:</b> {s.supplierType}</p>
                  <p><b>GST:</b> {s.gstNumber || "-"}</p>
                  <p><b>Address:</b> {s.address}</p>
                </div>

                <Textarea
                  placeholder="Verification notes (optional)"
                  value={notes[s.id] || ""}
                  onChange={(e) =>
                    setNotes((prev) => ({
                      ...prev,
                      [s.id]: e.target.value,
                    }))
                  }
                />

                <div className="flex gap-3">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                      verifySupplier(s.id, true, notes[s.id]).then(
                        () =>
                          setSuppliers((prev) =>
                            prev.filter((x) => x.id !== s.id),
                          ),
                      )
                    }
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>

                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() =>
                      verifySupplier(s.id, false, notes[s.id]).then(
                        () =>
                          setSuppliers((prev) =>
                            prev.filter((x) => x.id !== s.id),
                          ),
                      )
                    }
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
