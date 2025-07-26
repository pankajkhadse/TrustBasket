"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Truck, Phone, User, Package, Navigation, CheckCircle, AlertCircle, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import DeliveryMap from "@/components/delivery-map"

export default function DeliveryTracking() {
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [activeDeliveries, setActiveDeliveries] = useState([
    {
      id: "ORD-001",
      vendor: "Rajesh's Street Food",
      supplier: "Fresh Veggies Co.",
      deliveryType: "third_party",
      deliveryPartner: "Zepto Express",
      deliveryBoy: {
        name: "Amit Kumar",
        phone: "+91 98765 43210",
        rating: 4.8,
        vehicle: "Bike",
      },
      status: "in_transit",
      progress: 65,
      estimatedTime: "15 mins",
      pickupLocation: {
        lat: 28.6139,
        lng: 77.209,
        address: "Fresh Veggies Co., Connaught Place, New Delhi",
      },
      dropLocation: {
        lat: 28.6304,
        lng: 77.2177,
        address: "Rajesh's Street Food, Karol Bagh, New Delhi",
      },
      currentLocation: {
        lat: 28.625,
        lng: 77.215,
      },
      timeline: [
        { status: "Order Placed", time: "10:30 AM", completed: true },
        { status: "Order Confirmed", time: "10:35 AM", completed: true },
        { status: "Picked Up", time: "11:15 AM", completed: true },
        { status: "In Transit", time: "11:20 AM", completed: true, current: true },
        { status: "Delivered", time: "Est. 11:45 AM", completed: false },
      ],
    },
    {
      id: "ORD-002",
      vendor: "Mumbai Chaat House",
      supplier: "Spice Masters",
      deliveryType: "self",
      status: "pickup_ready",
      progress: 25,
      estimatedTime: "Pickup Ready",
      pickupLocation: {
        lat: 28.6129,
        lng: 77.2295,
        address: "Spice Masters, Chandni Chowk, New Delhi",
      },
      dropLocation: {
        lat: 28.6562,
        lng: 77.241,
        address: "Mumbai Chaat House, Civil Lines, New Delhi",
      },
      timeline: [
        { status: "Order Placed", time: "09:45 AM", completed: true },
        { status: "Order Confirmed", time: "09:50 AM", completed: true },
        { status: "Ready for Pickup", time: "10:30 AM", completed: true, current: true },
        { status: "Picked Up", time: "Pending", completed: false },
        { status: "Delivered", time: "Pending", completed: false },
      ],
    },
    {
      id: "ORD-003",
      vendor: "Delhi Street Kitchen",
      supplier: "Dairy Fresh",
      deliveryType: "pickup",
      status: "delivered",
      progress: 100,
      estimatedTime: "Delivered",
      pickupLocation: {
        lat: 28.5355,
        lng: 77.391,
        address: "Dairy Fresh, Noida Sector 18",
      },
      dropLocation: {
        lat: 28.6139,
        lng: 77.209,
        address: "Delhi Street Kitchen, CP, New Delhi",
      },
      timeline: [
        { status: "Order Placed", time: "08:30 AM", completed: true },
        { status: "Order Confirmed", time: "08:35 AM", completed: true },
        { status: "Vendor Pickup", time: "09:15 AM", completed: true },
        { status: "In Transit", time: "09:20 AM", completed: true },
        { status: "Delivered", time: "10:05 AM", completed: true, current: true },
      ],
    },
  ])

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "pickup_ready":
        return "bg-orange-100 text-orange-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return CheckCircle
      case "in_transit":
        return Truck
      case "pickup_ready":
        return Package
      case "processing":
        return Timer
      default:
        return AlertCircle
    }
  }

  const getDeliveryTypeLabel = (type) => {
    switch (type) {
      case "self":
        return "Self Delivery"
      case "third_party":
        return "Third Party"
      case "pickup":
        return "Vendor Pickup"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Tracking</h1>
          <p className="text-gray-600">Track all deliveries in real-time with live location updates</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Active Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeDeliveries.map((delivery, index) => {
                    const StatusIcon = getStatusIcon(delivery.status)
                    return (
                      <motion.div
                        key={delivery.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedOrder?.id === delivery.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedOrder(delivery)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{delivery.id}</h4>
                          <Badge className={getStatusColor(delivery.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {delivery.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <User className="h-4 w-4 mr-2" />
                            {delivery.vendor}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Package className="h-4 w-4 mr-2" />
                            {delivery.supplier}
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Truck className="h-4 w-4 mr-2" />
                            {getDeliveryTypeLabel(delivery.deliveryType)}
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{delivery.progress}%</span>
                          </div>
                          <Progress value={delivery.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm text-gray-500">ETA: {delivery.estimatedTime}</span>
                          {delivery.deliveryBoy && (
                            <Button size="sm" variant="outline">
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map and Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Tracking Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <DeliveryMap deliveries={activeDeliveries} selectedOrder={selectedOrder} />
                </CardContent>
              </Card>

              {/* Order Details */}
              {selectedOrder && (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details - {selectedOrder.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Delivery Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Pickup Location</p>
                              <p className="text-sm text-gray-600">{selectedOrder.pickupLocation.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Navigation className="h-4 w-4 text-red-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Drop Location</p>
                              <p className="text-sm text-gray-600">{selectedOrder.dropLocation.address}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Truck className="h-4 w-4 text-blue-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Delivery Type</p>
                              <p className="text-sm text-gray-600">
                                {getDeliveryTypeLabel(selectedOrder.deliveryType)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Partner Info */}
                      {selectedOrder.deliveryBoy && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Delivery Partner</h4>
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Avatar>
                              <AvatarImage
                                src="/placeholder.svg?height=40&width=40"
                                alt={selectedOrder.deliveryBoy.name}
                              />
                              <AvatarFallback>{selectedOrder.deliveryBoy.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{selectedOrder.deliveryBoy.name}</p>
                              <p className="text-sm text-gray-600">{selectedOrder.deliveryPartner}</p>
                              <div className="flex items-center mt-1">
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <div
                                      key={star}
                                      className={`h-3 w-3 ${
                                        star <= Math.floor(selectedOrder.deliveryBoy.rating)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    >
                                      ★
                                    </div>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600 ml-1">{selectedOrder.deliveryBoy.rating}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Timeline */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Delivery Timeline</h4>
                      <div className="space-y-3">
                        {selectedOrder.timeline.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 ${
                                step.completed
                                  ? "bg-green-500 border-green-500"
                                  : step.current
                                    ? "bg-blue-500 border-blue-500"
                                    : "bg-gray-200 border-gray-300"
                              }`}
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-sm font-medium ${
                                    step.completed || step.current ? "text-gray-900" : "text-gray-500"
                                  }`}
                                >
                                  {step.status}
                                </p>
                                <p className="text-sm text-gray-500">{step.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
