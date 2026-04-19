"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getNotifications } from "./actions"

export default function NotificationsPage() {
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        getNotifications().then(setLogs)
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center">
                <Bell className="mr-2" /> Notifications
            </h1>

            <div className="space-y-3">
                {logs.map((log) => (
                    <Card key={log.id}>
                        <CardContent className="p-4 text-sm">
                            <p className="font-medium">{log.action}</p>
                            <p className="text-gray-500">
                                {new Date(log.createdat).toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                {logs.length === 0 && (
                    <p className="text-gray-500">No notifications</p>
                )}
            </div>
        </div>
    )
}
