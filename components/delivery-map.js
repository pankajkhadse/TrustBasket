"use client"

import { useEffect, useRef, useState } from "react"

export default function DeliveryMap({ deliveries, selectedOrder }) {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])

  // Initialize map
  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      // Using OpenStreetMap with Leaflet (free alternative to Google Maps)
      const initMap = async () => {
        // For demo purposes, we'll create a simple map visualization
        // In production, you would integrate with Leaflet, Mapbox, or Google Maps

        const mapContainer = mapRef.current
        mapContainer.innerHTML = `
          <div class="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
              <!-- Map placeholder with delivery locations -->
              <div class="absolute top-4 left-4 bg-white p-2 rounded shadow">
                <p class="text-xs font-medium">Live Map View</p>
                <p class="text-xs text-gray-600">Delhi NCR Region</p>
              </div>
              
              <!-- Sample delivery points -->
              <div class="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                <div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                <div class="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">Fresh Veggies Co.</div>
              </div>
              
              <div class="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
                <div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                <div class="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">Rajesh's Street Food</div>
              </div>
              
              <!-- Moving delivery vehicle -->
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z"/>
                  </svg>
                </div>
                <div class="text-xs bg-white px-2 py-1 rounded shadow mt-1 whitespace-nowrap">Delivery in Progress</div>
              </div>
              
              <!-- Route line -->
              <svg class="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <pattern id="dashed" patternUnits="userSpaceOnUse" width="10" height="2">
                    <rect width="5" height="2" fill="#3B82F6"/>
                  </pattern>
                </defs>
                <path d="M 33% 25% Q 50% 40% 67% 67%" stroke="url(#dashed)" stroke-width="2" fill="none"/>
              </svg>
            </div>
            
            <!-- Map Controls -->
            <div class="absolute bottom-4 right-4 flex flex-col space-y-2">
              <button class="bg-white p-2 rounded shadow hover:bg-gray-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
              </button>
              <button class="bg-white p-2 rounded shadow hover:bg-gray-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <button class="bg-white p-2 rounded shadow hover:bg-gray-50">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
          </div>
        `
      }

      initMap()
    }
  }, [map])

  // Update map when selected order changes
  useEffect(() => {
    if (selectedOrder && mapRef.current) {
      // Update map focus to selected order
      console.log("Focusing map on order:", selectedOrder.id)
    }
  }, [selectedOrder])

  return (
    <div className="w-full">
      <div ref={mapRef} className="w-full h-96 bg-gray-100 rounded-lg">
        {/* Map will be rendered here */}
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Pickup Location</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Drop Location</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Delivery Vehicle</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
          <span>Route</span>
        </div>
      </div>
    </div>
  )
}
