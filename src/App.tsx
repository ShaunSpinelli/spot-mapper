import { useState, useEffect, useMemo } from 'react'
import { encodeToUrlSafeBase64, decodeFromUrlSafeBase64 } from './utils/base64.js'
import MapComponent from './components/MapComponent.js'

interface MapLocation {
  lat: number
  lng: number
  name: string
  description?: string
}

export interface Trip {
  id: string
  title: string
  destination: string
  startDate: string
  endDate: string
  description?: string
  image?: string
}

function App() {
  
  // Map locations state
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([
    {
      lat: 36.3932,
      lng: 25.4615,
      name: 'Santorini, Greece',
      description: 'Beautiful Greek island with stunning sunsets'
    },
    {
      lat: 46.5197,
      lng: 6.6323,
      name: 'Swiss Alps, Switzerland', 
      description: 'Breathtaking alpine landscapes and hiking trails'
    },
    {
      lat: 48.8566,
      lng: 2.3522,
      name: 'Paris, France',
      description: 'The City of Light with iconic landmarks'
    },
    {
      lat: 35.6762,
      lng: 139.6503,
      name: 'Tokyo, Japan',
      description: 'Modern metropolis with rich culture'
    },
    {
      lat: -33.8688,
      lng: 151.2093,
      name: 'Sydney, Australia',
      description: 'Harbor city with beautiful beaches'
    }
  ])
  
  const [newLocation, setNewLocation] = useState({
    lat: '',
    lng: '',
    name: '',
    description: ''
  })
  const [showAddLocationForm, setShowAddLocationForm] = useState(false)
  const [locationsShareUrl, setLocationsShareUrl] = useState<string>('')
  const [isMapAddingMode, setIsMapAddingMode] = useState(false)
  const [targetLocation, setTargetLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [openPopupLocationIndex, setOpenPopupLocationIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Check URL for locations on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const locationsParam = urlParams.get('locations')
    
    if (locationsParam) {
      try {
        // Decode URL-safe base64 locations
        const decoded = decodeFromUrlSafeBase64<MapLocation[]>(locationsParam)
        setMapLocations(decoded)
        console.log('Locations loaded from URL:', decoded)
      } catch (error) {
        console.error('Failed to decode locations from URL:', error)
        alert('Invalid locations data in URL')
      }
    }
  }, [])



  // Location management functions
  const addLocation = (e: React.FormEvent) => {
    e.preventDefault()
    const lat = parseFloat(newLocation.lat)
    const lng = parseFloat(newLocation.lng)
    
    if (isNaN(lat) || isNaN(lng) || !newLocation.name.trim()) {
      alert('Please enter valid coordinates and location name')
      return
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (lat: -90 to 90, lng: -180 to 180)')
      return
    }
    
    const location: MapLocation = {
      lat,
      lng,
      name: newLocation.name.trim(),
      description: newLocation.description.trim() || undefined
    }
    
    setMapLocations([...mapLocations, location])
    setNewLocation({ lat: '', lng: '', name: '', description: '' })
    setShowAddLocationForm(false)
    console.log('Added new location:', location)
  }

  const deleteLocation = (index: number) => {
    const updatedLocations = mapLocations.filter((_, i) => i !== index)
    setMapLocations(updatedLocations)
  }

  const generateLocationsShareUrl = () => {
    if (mapLocations.length > 0) {
      const urlSafeEncoded = encodeToUrlSafeBase64(mapLocations)
      const currentUrl = new URL(window.location.href)
      
      // Clean URL and add locations parameter
      currentUrl.searchParams.delete('locations')
      currentUrl.searchParams.set('locations', urlSafeEncoded)
      
      const shareableUrl = currentUrl.toString()
      setLocationsShareUrl(shareableUrl)
      console.log('Generated locations share URL:', shareableUrl)
      return shareableUrl
    }
    return ''
  }

  const copyLocationsShareUrl = async () => {
    const url = locationsShareUrl || generateLocationsShareUrl()
    if (url) {
      try {
        await navigator.clipboard.writeText(url)
        alert('Locations share URL copied to clipboard! 🎉\nAnyone can use this URL to see your custom locations.')
      } catch (error) {
        console.error('Failed to copy locations URL to clipboard:', error)
        alert('Failed to copy URL to clipboard')
      }
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleMapAddLocation = (lat: number, lng: number, locationData: { name: string, description: string }) => {
    const location: MapLocation = {
      lat,
      lng,
      name: locationData.name,
      description: locationData.description || undefined
    }
    
    setMapLocations([...mapLocations, location])
    console.log('Added location from map:', location)
    setIsMapAddingMode(false)
  }

  const handleLocationClick = (location: MapLocation, index: number) => {
    console.log('Location clicked:', location, 'index:', index)
    setTargetLocation({ lat: location.lat, lng: location.lng })
    setOpenPopupLocationIndex(index)
    console.log('Set targetLocation to:', { lat: location.lat, lng: location.lng })
    console.log('Set openPopupLocationIndex to:', index)
    // Clear the target after a longer delay to ensure the view stays focused
    setTimeout(() => {
      setTargetLocation(null)
      setOpenPopupLocationIndex(null)
      console.log('Cleared targetLocation and openPopupLocationIndex')
    }, 5000)
  }

  const openInGoogleMaps = (location: MapLocation) => {
    // Create Google Maps URL with coordinates
    const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}&ll=${location.lat},${location.lng}&z=15`
    window.open(googleMapsUrl, '_blank')
  }

  // Calculate optimal map view to show all locations (memoized for performance)
  const mapBounds = useMemo(() => {
    if (mapLocations.length === 0) {
      return {
        center: [46.5197, 6.6323] as [number, number], // Default to Switzerland
        zoom: isMobile ? 3 : 4 // Lower zoom for mobile
      }
    }

    if (mapLocations.length === 1) {
      return {
        center: [mapLocations[0].lat, mapLocations[0].lng] as [number, number],
        zoom: isMobile ? 8 : 10 // Lower zoom for mobile
      }
    }

    // Calculate bounding box
    const lats = mapLocations.map(loc => loc.lat)
    const lngs = mapLocations.map(loc => loc.lng)
    
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Calculate center
    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2

    // Calculate zoom level based on the span
    const latSpan = maxLat - minLat
    const lngSpan = maxLng - minLng
    const maxSpan = Math.max(latSpan, lngSpan)

    // Mobile-aware zoom calculation
    let zoom = isMobile ? 3 : 4
    if (maxSpan < 0.01) {
      zoom = isMobile ? 11 : 13      // Very close locations
    } else if (maxSpan < 0.1) {
      zoom = isMobile ? 8 : 10       // City level
    } else if (maxSpan < 1) {
      zoom = isMobile ? 5 : 7        // Regional level
    } else if (maxSpan < 10) {
      zoom = isMobile ? 3 : 5        // Country level
    } else {
      zoom = isMobile ? 2 : 3        // Continental level
    }

    return {
      center: [centerLat, centerLng] as [number, number],
      zoom
    }
  }, [mapLocations, isMobile])



  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      overflow: 'hidden'
    }}>
      {/* Sidebar Panel - Left on desktop, Bottom on mobile */}
      <div style={{ 
        width: isMobile ? '100%' : '400px',
        minWidth: isMobile ? 'auto' : '400px',
        height: isMobile ? '33vh' : '100vh',
        backgroundColor: 'white',
        boxShadow: isMobile 
          ? '0 -2px 8px rgba(0, 0, 0, 0.1)' 
          : '2px 0 8px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        order: isMobile ? 2 : 1
      }}>
        {/* Header */}
        {!isMobile && (
     <div style={{ 
      padding: isMobile ? '12px 16px' : '20px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f8fafc'
    }}>
      <h1 style={{ 
        color: 'black', 
        fontSize: isMobile ? '18px' : '24px', 
        marginBottom: isMobile ? '4px' : '8px', 
        margin: 0 
      }}>
        🗺️ My Trip
      </h1>
      {!isMobile && (
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          Discover & manage locations
        </p>
      )}
    </div>

        )}
   
        {/* Controls */}

        {!isMobile && (
        <div style={{ 
          padding: isMobile ? '8px 16px' : '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#fafbfc'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'row' : 'column', 
            gap: isMobile ? '8px' : '12px' 
          }}>
            <button
              onClick={() => {
                setIsMapAddingMode(!isMapAddingMode)
                setShowAddLocationForm(false)
              }}
              style={{
                backgroundColor: isMapAddingMode ? '#ef4444' : '#7c3aed',
                color: 'white',
                padding: isMobile ? '8px 12px' : '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                width: isMobile ? '50%' : '100%'
              }}
            >
              {isMapAddingMode ? '❌ Cancel' : '🖱️ Click Add'}
            </button>
            
            <button
              onClick={() => {
                setShowAddLocationForm(true)
                setIsMapAddingMode(false)
              }}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: isMobile ? '8px 12px' : '12px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: '500',
                width: isMobile ? '50%' : '100%'
              }}
            >
              📍 Add Form
            </button>
          </div>

          {/* Add Location Form */}
          {showAddLocationForm && (
            <div style={{ 
              backgroundColor: '#f0fdf4', 
              border: '1px solid #bbf7d0', 
              borderRadius: '8px', 
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#15803d', fontSize: '16px', marginBottom: '10px' }}>📍 Add New Location</h3>
              <form onSubmit={addLocation}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
                      Latitude *
                    </label>
                    <input
                      type="number"
                      name="lat"
                      value={newLocation.lat}
                      onChange={handleLocationChange}
                      step="any"
                      min="-90"
                      max="90"
                      required
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                      placeholder="e.g., 40.7128"
                    />
                  </div>
      <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
                      Longitude *
                    </label>
                    <input
                      type="number"
                      name="lng"
                      value={newLocation.lng}
                      onChange={handleLocationChange}
                      step="any"
                      min="-180"
                      max="180"
                      required
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                      placeholder="e.g., -74.0060"
                    />
                  </div>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
                    Location Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newLocation.name}
                    onChange={handleLocationChange}
                    required
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                    placeholder="e.g., Central Park, New York"
                  />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#15803d', fontSize: '12px', fontWeight: 'bold' }}>
                    Description (optional)
                  </label>
                  <textarea
                    name="description"
                    value={newLocation.description}
                    onChange={handleLocationChange}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      resize: 'vertical'
                    }}
                    placeholder="Brief description of this location..."
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#059669',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ✅ Add Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddLocationForm(false)}
                    style={{
                      backgroundColor: '#6b7280',
                      color: 'white',
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
              
              <div style={{ 
                marginTop: '10px', 
                padding: '8px', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '4px', 
                fontSize: '11px', 
                color: '#1e40af' 
              }}>
                💡 <strong>Tip:</strong> You can find coordinates by searching on Google Maps, right-clicking a location, and selecting the coordinates.
              </div>
            </div>
          )}
        </div>
        )}


        {/* Click Mode Indicator */}
        {isMapAddingMode && (
          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '4px', 
            padding: isMobile ? '8px' : '12px',
            margin: isMobile ? '0 16px 8px 16px' : '0 16px 16px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: isMobile ? '11px' : '12px', 
              color: '#92400e' 
            }}>
              <span style={{ marginRight: '6px' }}>🖱️</span>
              <strong>Click Mode Active</strong>
            </div>
            {window.innerWidth > 768 && (
              <p style={{ fontSize: '11px', color: '#b45309', margin: '4px 0 0 24px' }}>
                Click anywhere on the map to add a location!
              </p>
            )}
          </div>
        )}

        {/* Locations List */}
        <div style={{ 
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            padding: isMobile ? '12px 16px' : '16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: isMobile ? '4px' : '8px' 
            }}>
              <h3 style={{ 
                color: 'black', 
                fontSize: isMobile ? '14px' : '16px', 
                margin: 0 
              }}>
                📍 Locations ({mapLocations.length})
              </h3>
              <button
                onClick={generateLocationsShareUrl}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: isMobile ? '4px 8px' : '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px'
                }}
              >
                🔗 Share
              </button>
            </div>
            {window.innerWidth > 768 && (
              <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
                Click any location to center map
              </p>
            )}
          </div>

          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '8px 16px' : '16px'
          }}>
            {mapLocations.length === 0 ? (
              <div style={{ 
                textAlign: 'center',
                padding: isMobile ? '20px 10px' : '40px 20px',
                color: '#9ca3af'
              }}>
                <div style={{ 
                  fontSize: isMobile ? '24px' : '32px', 
                  marginBottom: isMobile ? '8px' : '12px' 
                }}>
                  🗺️
                </div>
                <p style={{ 
                  fontSize: isMobile ? '12px' : '14px', 
                  margin: 0 
                }}>
                  No locations yet
                </p>
                <p style={{ 
                  fontSize: isMobile ? '10px' : '12px', 
                  margin: '4px 0 0 0' 
                }}>
                  {isMobile ? 'Tap to add!' : 'Click the map or use the form to add some!'}
                </p>
              </div>
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: isMobile ? '8px' : '12px' 
              }}>
                {mapLocations.map((location, index) => (
                  <div 
                    key={index}
                    onClick={() => handleLocationClick(location, index)}
                    style={{ 
                      backgroundColor: '#f8fafc', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: isMobile ? '6px' : '8px', 
                      padding: isMobile ? '8px' : '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f1f5f9'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    title="Click to center map on this location"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, pointerEvents: 'none' }}>
                        <h4 style={{ 
                          margin: '0 0 3px 0', 
                          fontSize: isMobile ? '12px' : '14px', 
                          fontWeight: 'bold', 
                          color: '#1e293b' 
                        }}>
                          🗺️ {location.name}
                        </h4>
                        <p style={{ 
                          margin: '0 0 4px 0', 
                          fontSize: isMobile ? '9px' : '11px', 
                          color: '#64748b' 
                        }}>
                          📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                        {location.description && (
                          <p style={{ 
                            margin: 0, 
                            fontSize: isMobile ? '10px' : '12px', 
                            color: '#475569' 
                          }}>
                            {isMobile && location.description.length > 50 
                              ? location.description.substring(0, 50) + '...'
                              : location.description
                            }
                          </p>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        gap: isMobile ? '3px' : '4px', 
                        marginLeft: isMobile ? '6px' : '8px' 
                      }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            openInGoogleMaps(location)
                          }}
                          style={{
                            backgroundColor: '#4285f4',
                            color: 'white',
                            border: 'none',
                            borderRadius: isMobile ? '3px' : '4px',
                            padding: isMobile ? '3px 5px' : '4px 6px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '8px' : '10px'
                          }}
                          title="View in Google Maps"
                        >
                          🗺️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLocation(index)
                          }}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: isMobile ? '3px' : '4px',
                            padding: isMobile ? '3px 5px' : '4px 6px',
                            cursor: 'pointer',
                            fontSize: isMobile ? '8px' : '10px'
                          }}
                          title="Delete location"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share URL Display */}
          {locationsShareUrl && (
            <div style={{ 
              padding: '12px 16px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#fef3c7'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#92400e', fontWeight: 'bold' }}>
                🔗 Share URL:
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <code style={{ 
                  fontSize: '10px', 
                  color: '#92400e', 
                  flex: 1,
                  background: 'rgba(255,255,255,0.5)',
                  padding: '4px 6px',
                  borderRadius: '3px',
                  wordBreak: 'break-all'
                }}>
                  {locationsShareUrl.length > 50 ? locationsShareUrl.substring(0, 50) + '...' : locationsShareUrl}
                </code>
                <button
                  onClick={copyLocationsShareUrl}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '10px'
                  }}
                >
                  📋
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map Area - Full screen on desktop, 2/3 height on mobile */}
      <div style={{ 
        flex: 1,
        height: isMobile ? '67vh' : '100vh',
        position: 'relative',
        order: isMobile ? 1 : 2
      }}>
        <MapComponent 
          locations={mapLocations}
          center={mapBounds.center}
          zoom={mapBounds.zoom}
          height={isMobile ? '67vh' : '100vh'}
          onAddLocation={handleMapAddLocation}
          isAddingMode={isMapAddingMode}
          targetLocation={targetLocation}
          openPopupLocationId={openPopupLocationIndex}
        />
      </div>
    </div>
  )
}

export default App
