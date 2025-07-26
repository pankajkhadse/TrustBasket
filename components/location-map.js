"use client"

import { useEffect, useRef } from "react"

export default function LocationMap({ locations, selectedLocation, onLocationSelect }) {
  const mapRef = useRef(null)

  useEffect(() => {
    if (mapRef.current) {
      // Create interactive map with all locations
      const mapContainer = mapRef.current
      mapContainer.innerHTML = `
        <div class="relative w-full h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden">
          <!-- Map Header -->
          <div class="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg z-10">
            <h3 class="font-medium text-gray-900">Delhi NCR Region</h3>
            <p class="text-sm text-gray-600">${locations.length} locations found</p>
          </div>
          
          <!-- Map Legend -->
          <div class="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-10">
            <div class="space-y-2 text-sm">
              <div class="flex items-center">
                <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Vendors</span>
              </div>
              <div class="flex items-center">
                <div class="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span>Suppliers</span>
              </div>
            </div>
          </div>

          <!-- Location Markers -->
          ${locations
            .map((location, index) => {
              const isSelected = selectedLocation?.id === location.id
              const color = location.type === "vendor" ? "green" : "orange"
              const positions = [
                { top: "20%", left: "25%" },
                { top: "30%", left: "60%" },
                { top: "50%", left: "40%" },
                { top: "65%", left: "70%" },
                { top: "70%", left: "30%" },
                { top: "40%", left: "80%" },
              ]
              const position = positions[index % positions.length]

              return `
              <div 
                class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${isSelected ? "scale-125 z-20" : "z-10"}"
                style="top: ${position.top}; left: ${position.left};"
                onclick="window.selectLocation(${location.id})"
              >
                <div class="relative">
                  <div class="w-8 h-8 bg-${color}-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${isSelected ? "animate-pulse" : ""}">
                    <span class="text-white text-xs font-bold">${location.type === "vendor" ? "🍽️" : "📦"}</span>
                  </div>
                  ${
                    isSelected
                      ? `
                    <div class="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-xl border min-w-48">
                      <h4 class="font-medium text-gray-900 mb-1">${location.name}</h4>
                      <p class="text-sm text-gray-600 mb-2">${location.category}</p>
                      <div class="flex items-center text-xs text-gray-500">
                        <span class="text-yellow-400">★</span>
                        <span class="ml-1">${location.rating}</span>
                      </div>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `
            })
            .join("")}

          <!-- Map Controls -->
          <div class="absolute bottom-4 right-4 flex flex-col space-y-2">
            <button class="bg-white p-2 rounded shadow hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </button>
            <button class="bg-white p-2 rounded shadow hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
              </svg>
            </button>
            <button class="bg-white p-2 rounded shadow hover:bg-gray-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>

          <!-- Distance Lines (if location is selected) -->
          ${
            selectedLocation
              ? `
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <pattern id="dashed-line" patternUnits="userSpaceOnUse" width="8" height="2">
                  <rect width="4" height="2" fill="#10B981"/>
                </pattern>
              </defs>
              <!-- Sample connection lines -->
              <path d="M 25% 20% Q 40% 35% 60% 30%" stroke="url(#dashed-line)" stroke-width="2" fill="none" opacity="0.6"/>
              <path d="M 60% 30% Q 55% 50% 40% 50%" stroke="url(#dashed-line)" stroke-width="2" fill="none" opacity="0.6"/>
            </svg>
          `
              : ""
          }
        </div>
      `

      // Add click handler for location selection
      window.selectLocation = (locationId) => {
        const location = locations.find((loc) => loc.id === locationId)
        if (location && onLocationSelect) {
          onLocationSelect(location)
        }
      }
    }

    // Cleanup
    return () => {
      if (window.selectLocation) {
        delete window.selectLocation
      }
    }
  }, [locations, selectedLocation, onLocationSelect])

  return (
    <div className="w-full">
      <div ref={mapRef} className="w-full h-96 bg-gray-100 rounded-lg">
        {/* Map will be rendered here */}
      </div>

      {/* Map Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">{locations.filter((l) => l.type === "vendor").length}</div>
          <div className="text-sm text-gray-600">Vendors</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-orange-600">
            {locations.filter((l) => l.type === "supplier").length}
          </div>
          <div className="text-sm text-gray-600">Suppliers</div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {(locations.reduce((sum, l) => sum + l.rating, 0) / locations.length).toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-600">5km</div>
          <div className="text-sm text-gray-600">Avg Distance</div>
        </div>
      </div>
    </div>
  )
}
