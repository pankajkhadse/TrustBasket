"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SupplierNavbar from "@/components/supplier-navbar"
import { getSupplierProfile, updateSupplierProfile } from "./actions"

export default function SupplierProfilePage() {
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        getSupplierProfile().then(setProfile)
    }, [])

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gray-50">
            <SupplierNavbar />

            <div className="max-w-xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">My Profile</h1>

                <div className="space-y-4">
                    <div>
                        <Label>Owner Name</Label>
                        <Input value={profile.name} disabled />
                    </div>

                    <div>
                        <Label>Shop Name</Label>
                        <Input
                            value={profile.shopName || ""}
                            onChange={(e) =>
                                setProfile({ ...profile, shopName: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <Label>Phone</Label>
                        <Input value={profile.phone} disabled />
                    </div>

                    <div>
                        <Label>Status</Label>
                        <Input value={profile.status} disabled />
                    </div>

                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateSupplierProfile(profile)}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}
