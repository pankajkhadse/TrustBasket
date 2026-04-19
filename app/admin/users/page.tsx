"use client"

import { useEffect, useState } from "react"
import { Shield, Ban, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import AdminNavbar from "@/components/admin-navbar"
import { getAllUsers, toggleUserBlock } from "./actions"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllUsers().then((res) => {
      setUsers(res)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{u.role}</Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          u.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : u.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {u.status}
                      </Badge>
                    </TableCell>

                    <TableCell>{u.phone}</TableCell>

                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      {u.isBlocked ? (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            toggleUserBlock(u.id, false).then(() =>
                              setUsers((prev) =>
                                prev.map((x) =>
                                  x.id === u.id
                                    ? { ...x, isBlocked: false }
                                    : x,
                                ),
                              ),
                            )
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Unblock
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                          onClick={() =>
                            toggleUserBlock(u.id, true, "Policy violation").then(
                              () =>
                                setUsers((prev) =>
                                  prev.map((x) =>
                                    x.id === u.id
                                      ? { ...x, isBlocked: true }
                                      : x,
                                  ),
                                ),
                            )
                          }
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Block
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
