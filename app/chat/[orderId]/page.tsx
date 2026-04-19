"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getChatByOrder, sendMessage, markMessagesRead } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ChatPage() {
  const { orderId } = useParams()
  const [chat, setChat] = useState<any>(null)
  const [text, setText] = useState("")

  useEffect(() => {
    getChatByOrder(orderId as string).then((c) => {
      setChat(c)
      if (c) markMessagesRead(c.id)
    })
  }, [orderId])

  const submit = async () => {
    if (!text.trim()) return
    await sendMessage(chat.id, text)
    setText("")
    const updated = await getChatByOrder(orderId as string)
    setChat(updated)
  }

  if (!chat) return <div>Loading...</div>

  return (
    <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col">
      <div className="border-b pb-2 mb-4 font-semibold">
        Order Chat #{orderId}
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chat.messages.map((m: any) => (
          <div
            key={m.id}
            className={`p-2 rounded max-w-[70%] ${
              m.senderId === chat.vendorId
                ? "bg-green-100 ml-auto"
                : "bg-gray-100"
            }`}
          >
            <p className="text-sm">{m.text}</p>
            <span className="text-xs text-gray-500">
              {new Date(m.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
        />
        <Button onClick={submit}>Send</Button>
      </div>
    </div>
  )
}
