import React, { useState, useRef, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapLocation {
  lat: number
  lng: number
  name: string
  description?: string
  id?: string | number
}

interface MapComponentProps {
  locations?: MapLocation[]
  center?: [number, number]
  zoom?: number
  height?: string
  onAddLocation?: (lat: number, lng: number, data: { name: string, description: string }) => void
  isAddingMode?: boolean
  targetLocation?: { lat: number, lng: number } | null
  openPopupLocationId?: string | number | null
}

// Component to handle map clicks
function ClickHandler({ onAddLocation, isAddingMode }: { onAddLocation?: (lat: number, lng: number) => void, isAddingMode?: boolean }) {
  useMapEvents({
    click: (e) => {
      if (isAddingMode && onAddLocation) {
        const { lat, lng } = e.latlng
        onAddLocation(lat, lng)
      }
    }
  })
  return null
}

// Simple component to handle targetLocation centering
function MapCenterController({ targetLocation }: { targetLocation?: { lat: number, lng: number } | null }) {
  const map = useMapEvents({})
  
  React.useEffect(() => {
    if (targetLocation) {
      console.log('MapCenterController: Centering map on:', targetLocation)
      // Add a small delay to ensure any other map updates have finished
      setTimeout(() => {
        map.setView([targetLocation.lat, targetLocation.lng], 15, {
          animate: true,
          duration: 1
        })
      }, 50)
    }
  }, [targetLocation, map])
  
  return null
}

// Component to handle individual location markers with automatic popup opening
function LocationMarker({ location, shouldOpenPopup }: { 
  location: MapLocation
  shouldOpenPopup: boolean 
}) {
  const markerRef = useRef<any>(null)
  
  useEffect(() => {
    if (shouldOpenPopup && markerRef.current) {
      markerRef.current.openPopup()
    }
  }, [shouldOpenPopup])
  
  return (
    <Marker ref={markerRef} position={[location.lat, location.lng]}>
      <Popup>
        <div>
          <strong>{location.name}</strong>
          {location.description && (
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
              {location.description}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  locations = [], 
  center = [51.505, -0.09], // Default to London
  zoom = 13,
  height = '400px',
  onAddLocation,
  isAddingMode = false,
  targetLocation = null,
  openPopupLocationId = null
}) => {
  const [pendingLocation, setPendingLocation] = useState<{lat: number, lng: number} | null>(null)

  const handleMapClick = (lat: number, lng: number) => {
    setPendingLocation({ lat, lng })
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ClickHandler onAddLocation={handleMapClick} isAddingMode={isAddingMode} />
        <MapCenterController targetLocation={targetLocation} />
        
        {locations.map((location, index) => (
          <LocationMarker 
            key={location.id || index} 
            location={location}
            shouldOpenPopup={openPopupLocationId === location.id || (openPopupLocationId === index && !location.id)}
          />
        ))}

        {/* Show pending location marker */}
        {pendingLocation && isAddingMode && (
          <Marker position={[pendingLocation.lat, pendingLocation.lng]}>
            <Popup>
              <div style={{ padding: '10px', minWidth: '200px' }}>
                <LocationForm 
                  lat={pendingLocation.lat}
                  lng={pendingLocation.lng}
                  onSave={(locationData) => {
                    if (onAddLocation) {
                      onAddLocation(pendingLocation.lat, pendingLocation.lng, locationData)
                    }
                    setPendingLocation(null)
                  }}
                  onCancel={() => setPendingLocation(null)}
                />
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

// Quick form component for adding location details
function LocationForm({ 
  lat, 
  lng, 
  onSave, 
  onCancel 
}: { 
  lat: number
  lng: number
  onSave: (data: { name: string, description: string }) => void
  onCancel: () => void 
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave({ name: name.trim(), description: description.trim() })
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ fontSize: '12px' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>📍 Add Location</strong>
        <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Location name *"
          required
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontSize: '12px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            fontSize: '12px',
            resize: 'vertical'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <button
          type="submit"
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          ✅ Add
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '3px',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default MapComponent

