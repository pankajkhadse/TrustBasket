"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Search, Filter, Star, Phone, Navigation, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LocationMap from "@/components/location-map"

export default function LocationsMap() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const [locations] = useState([
    {
      id: 1,
      name: "Rajesh's Street Food",
      type: "vendor",
      category: "North Indian",
      rating: 4.8,
      address: "Karol Bagh, New Delhi",
      phone: "+91 98765 43210",
      coordinates: { lat: 28.6304, lng: 77.2177 },
      openTime: "10:00 AM - 10:00 PM",
      specialties: ["Chole Bhature", "Rajma Rice", "Lassi"],
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 2,
      name: "Fresh Veggies Co.",
      type: "supplier",
      category: "Vegetables",
      rating: 4.9,
      address: "Connaught Place, New Delhi",
      phone: "+91 98765 43211",
      coordinates: { lat: 28.6139, lng: 77.209 },
      openTime: "6:00 AM - 8:00 PM",
      specialties: ["Fresh Vegetables", "Organic Produce", "Daily Supply"],
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 3,
      name: "Mumbai Chaat House",
      type: "vendor",
      category: "Street Food",
      rating: 4.7,
      address: "Civil Lines, New Delhi",
      phone: "+91 98765 43212",
      coordinates: { lat: 28.6562, lng: 77.241 },
      openTime: "4:00 PM - 11:00 PM",
      specialties: ["Pani Puri", "Bhel Puri", "Dahi Puri"],
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 4,
      name: "Spice Masters",
      type: "supplier",
      category: "Spices",
      rating: 4.8,
      address: "Chandni Chowk, New Delhi",
      phone: "+91 98765 43213",
      coordinates: { lat: 28.6129, lng: 77.2295 },
      openTime: "9:00 AM - 7:00 PM",
      specialties: ["Whole Spices", "Ground Spices", "Masala Blends"],
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 5,
      name: "Delhi Street Kitchen",
      type: "vendor",
      category: "Fast Food",
      rating: 4.6,
      address: "Lajpat Nagar, New Delhi",
      phone: "+91 98765 43214",
      coordinates: { lat: 28.5677, lng: 77.2431 },
      openTime: "11:00 AM - 11:00 PM",
      specialties: ["Burgers", "Sandwiches", "Momos"],
      image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: 6,
      name: "Dairy Fresh",
      type: "supplier",
      category: "Dairy",
      rating: 4.7,
      address: "Noida Sector 18",
      phone: "+91 98765 43215",
      coordinates: { lat: 28.5355, lng: 77.391 },
      openTime: "5:00 AM - 9:00 PM",
      specialties: ["Fresh Milk", "Paneer", "Yogurt"],
      image: "/placeholder.svg?height=60&width=60",
    },
  ])

  const filteredLocations = locations.filter((location) => {
    const matchesType = filterType === "all" || location.type === filterType
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getTypeColor = (type) => {
    return type === "vendor" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
  }

  const getTypeIcon = (type) => {
    return type === "vendor" ? "🍽️" : "📦"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Locations Map</h1>
          <p className="text-gray-600">Find vendors and suppliers near you with real-time location tracking</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, category, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="vendor">Vendors Only</SelectItem>
                <SelectItem value="supplier">Suppliers Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Locations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Locations ({filteredLocations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredLocations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedLocation?.id === location.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={location.image || "/placeholder.svg"} alt={location.name} />
                          <AvatarFallback>{getTypeIcon(location.type)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
                            <Badge className={getTypeColor(location.type)}>{location.type}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{location.category}</p>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= Math.floor(location.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">{location.rating}</span>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            {location.address}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {location.openTime}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                  <CardTitle>Interactive Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationMap
                    locations={filteredLocations}
                    selectedLocation={selectedLocation}
                    onLocationSelect={setSelectedLocation}
                  />
                </CardContent>
              </Card>

              {/* Location Details */}
              {selectedLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center space-x-4 mb-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={selectedLocation.image || "/placeholder.svg"}
                              alt={selectedLocation.name}
                            />
                            <AvatarFallback className="text-2xl">{getTypeIcon(selectedLocation.type)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedLocation.name}</h3>
                            <p className="text-gray-600">{selectedLocation.category}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.floor(selectedLocation.rating)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-600 ml-2">{selectedLocation.rating} rating</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-3 text-red-500" />
                            <span>{selectedLocation.address}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-3 text-blue-500" />
                            <span>{selectedLocation.openTime}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-3 text-green-500" />
                            <span>{selectedLocation.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties & Actions */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          {selectedLocation.type === "vendor" ? "Specialties" : "Products"}
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {selectedLocation.specialties.map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>

                        <div className="space-y-3">
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Now
                          </Button>
                          <Button variant="outline" className="w-full bg-transparent">
                            <Navigation className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                          {selectedLocation.type === "supplier" && (
                            <Button variant="outline" className="w-full bg-transparent">
                              <MapPin className="h-4 w-4 mr-2" />
                              View Products
                            </Button>
                          )}
                        </div>
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
