import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { type LatLngExpression } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, Typography } from '@mui/material'
import { colors } from '../theme/colors'

// Fix for default markers in leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Custom green marker for available stations
const AvailableIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Red marker for unavailable
const UnavailableIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface LocationMarker {
  id: string
  title: string
  location: string
  lat: number
  lng: number
  available: boolean
  chargerType: string
  pricePerHour: number
}

interface MapComponentProps {
  listings: LocationMarker[]
  onMarkerClick?: (listing: LocationMarker) => void
}

export default function MapComponent({ listings, onMarkerClick }: MapComponentProps) {
  // Center of San Francisco
  const center: LatLngExpression = [37.7749, -122.4194]

  return (
    <Box
      sx={{
        width: '100%',
        height: '400px',
        borderRadius: 2,
        overflow: 'hidden',
        border: `2px solid ${colors.primary}`,
        mb: 4,
      }}
    >
      <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {listings.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={marker.available ? AvailableIcon : UnavailableIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(marker)
                }
              },
            }}
          >
            <Popup>
              <Box sx={{ p: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {marker.title}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  {marker.location}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                  Type: {marker.chargerType}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: colors.primary, fontWeight: 'bold' }}>
                  ${marker.pricePerHour.toFixed(2)}/hr
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: marker.available ? colors.success : colors.error }}>
                  {marker.available ? '✓ Available' : '✕ Unavailable'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  )
}
