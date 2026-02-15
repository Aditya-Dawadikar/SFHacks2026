import { useState, useEffect } from 'react'

interface SlotData {
  _id: string;
  date: string;
  reservedStartTime: string;
  reservedEndTime: string;
  status: string;
}
// Hardcoded location data for suggestions
const HARDCODED_LOCATIONS = [
  { label: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194 },
  { label: 'Oakland, CA', latitude: 37.8044, longitude: -122.2712 },
  { label: 'San Jose, CA', latitude: 37.3382, longitude: -121.8863 },
  { label: 'Berkeley, CA', latitude: 37.8715, longitude: -122.2730 },
  { label: 'Palo Alto, CA', latitude: 37.4419, longitude: -122.1430 },
]
import {
  Container,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Rating,
  Chip,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import BreadcrumbNav from '../../components/BreadcrumbNav'
import MapComponent from '../../components/MapComponent'
import { colors } from '../../theme/colors'

interface ListingData {
  id: string
  title: string
  location: string
  chargerType: string
  pricePerHour: number
  rating: number
  reviews: number
  available: boolean
  distance?: string
  image: string
  images?: string[]
  availabilityStatus: 'available' | 'opens_soon' | 'closes_soon' | 'closed'
  lat: number
  lng: number
}

interface UpcomingReservation {
  listingId: string
  listingTitle: string
  listingLocation: string
  reservationDate: string
  reservationTime: string
  reservationDuration: number
  estimatedCost: number
}

interface ActiveSession {
  sessionId: string
  listingId: string
  listingTitle: string
  listingLocation: string
  chargerType: string
  pricePerHour: number
  startTime: string
  endTime: string
  timeRemainingMinutes: number
  energyUsed: number // kWh
  currentCost: number
}

interface BrowseListingsProps {
  onNavigate: (page: string) => void
}

// Mock upcoming reservation for demo
const mockUpcomingReservation: UpcomingReservation = {
  listingId: '1',
  listingTitle: 'Fast Charger Downtown',
  listingLocation: 'Downtown, San Francisco',
  reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
  reservationTime: '14:30',
  reservationDuration: 2,
  estimatedCost: 17.0,
}

// Mock active session for demo (session ending soon)
const mockActiveSession: ActiveSession = {
  sessionId: 'SESSION-001',
  listingId: '3',
  listingTitle: 'Premium Fast Charge',
  listingLocation: 'Financial District, San Francisco',
  chargerType: 'DC Fast Charger',
  pricePerHour: 9.5,
  startTime: new Date(Date.now() - 75 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), // Started 75 mins ago
  endTime: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), // Ends in 15 mins
  timeRemainingMinutes: 15,
  energyUsed: 12.5,
  currentCost: 4.75,
}

export default function BrowseListings({ onNavigate }: BrowseListingsProps) {
  const [searchLocation, setSearchLocation] = useState('')
  const [geoFilter, setGeoFilter] = useState<{ latitude: number; longitude: number; radius: number } | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<{ label: string; latitude: number; longitude: number }[]>([])
  const [listings, setListings] = useState<ListingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openReservationModal, setOpenReservationModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState<ListingData | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [reservationDate, setReservationDate] = useState('')
  const [reservationTime, setReservationTime] = useState('10:00')
  const [reservationDuration, setReservationDuration] = useState(1)
  const [errors, setErrors] = useState<{ date?: string; time?: string; duration?: string }>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [upcomingReservation, setUpcomingReservation] = useState<UpcomingReservation | null>(mockUpcomingReservation)
  const [showReservationBanner, setShowReservationBanner] = useState(true)
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(mockActiveSession)
  const [showSessionBanner, setShowSessionBanner] = useState(true)
  const [openExtendSessionModal, setOpenExtendSessionModal] = useState(false)
  const [extendSessionDuration, setExtendSessionDuration] = useState(1)
  // Slot selection state (must be inside component)
  const [availableSlots, setAvailableSlots] = useState<SlotData[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)

  const handleSearch = () => {
    // If user selected a suggestion, use its coordinates
    const selected = HARDCODED_LOCATIONS.find(loc => loc.label.toLowerCase() === searchLocation.toLowerCase())
    if (selected) {
      setGeoFilter({ latitude: selected.latitude, longitude: selected.longitude, radius: 5 })
      return
    }
    // Otherwise, fallback to text search (local filtering)
    if (searchLocation.trim()) {
      const filtered = listings.filter((listing) =>
        listing.location.toLowerCase().includes(searchLocation.toLowerCase()),
      )
      setListings(filtered.length > 0 ? filtered : listings)
    } else if (geoFilter) {
      fetchListingsWithGeo(geoFilter.latitude, geoFilter.longitude, geoFilter.radius)
    }
  }
  // Show suggestions as user types
  useEffect(() => {
    if (searchLocation.length > 0) {
      setLocationSuggestions(
        HARDCODED_LOCATIONS.filter(loc =>
          loc.label.toLowerCase().includes(searchLocation.toLowerCase())
        )
      )
    } else {
      setLocationSuggestions([])
    }
  }, [searchLocation])

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoFilter({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            radius: 5, // default 5km
          })
          setSearchLocation('')
        },
        (err) => {
          setError('Failed to get current location')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser')
    }
  }

  // Duplicate handleCurrentLocation removed
  // Fetch listings from backend on mount
  // Fetch listings with geolocation filter
  const fetchListingsWithGeo = async (latitude: number, longitude: number, radius: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:5000/api/listings?latitude=${latitude}&longitude=${longitude}&radius=${radius}`)
      if (!res.ok) throw new Error('Failed to fetch listings')
      const data = await res.json()
      const mapped = (Array.isArray(data) ? data : data.listings).map((l: any) => ({
        id: l._id,
        title: l.title,
        location: l.location && (l.location.address || l.location.city || l.location.state || l.location.country || ''),
        chargerType: l.chargerType,
        pricePerHour: l.pricePerHour,
        rating: typeof l.rating === 'number' ? l.rating : 0,
        reviews: typeof l.totalReviews === 'number' ? l.totalReviews : 0,
        available: l.isActive !== undefined ? l.isActive : true,
        distance: '',
        availabilityStatus: l.isActive ? 'available' : 'closed',
        lat: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[1] : 0,
        lng: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[0] : 0,
      }))
      setListings(mapped)
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Reload handler
  const handleReload = async () => {
    setSearchLocation('')
    setGeoFilter(null)
    setLocationSuggestions([])
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('http://localhost:5000/api/listings')
      if (!res.ok) throw new Error('Failed to fetch listings')
      const data = await res.json()
      const mapped = (Array.isArray(data) ? data : data.listings).map((l: any) => ({
        id: l._id,
        title: l.title,
        location: l.location && (l.location.address || l.location.city || l.location.state || l.location.country || ''),
        chargerType: l.chargerType,
        pricePerHour: l.pricePerHour,
        rating: typeof l.rating === 'number' ? l.rating : 0,
        reviews: typeof l.totalReviews === 'number' ? l.totalReviews : 0,
        available: l.isActive !== undefined ? l.isActive : true,
        distance: '',
        availabilityStatus: l.isActive ? 'available' : 'closed',
        lat: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[1] : 0,
        lng: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[0] : 0,
      }))
      setListings(mapped)
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (geoFilter) {
      fetchListingsWithGeo(geoFilter.latitude, geoFilter.longitude, geoFilter.radius)
    } else {
      const fetchListings = async () => {
        setLoading(true)
        setError(null)
        try {
          const res = await fetch('http://localhost:5000/api/listings')
          if (!res.ok) throw new Error('Failed to fetch listings')
          const data = await res.json()
          const mapped = (Array.isArray(data) ? data : data.listings).map((l: any) => ({
            id: l._id,
            title: l.title,
            location: l.location && (l.location.address || l.location.city || l.location.state || l.location.country || ''),
            chargerType: l.chargerType,
            pricePerHour: l.pricePerHour,
            rating: typeof l.rating === 'number' ? l.rating : 0,
            reviews: typeof l.totalReviews === 'number' ? l.totalReviews : 0,
            available: l.isActive !== undefined ? l.isActive : true,
            distance: '',
            availabilityStatus: l.isActive ? 'available' : 'closed',
            lat: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[1] : 0,
            lng: l.location && l.location.coordinates && l.location.coordinates.coordinates ? l.location.coordinates.coordinates[0] : 0,
          }))
          setListings(mapped)
        } catch (err: any) {
          setError(err.message || 'Unknown error')
        } finally {
          setLoading(false)
        }
      }
      fetchListings()
    }
  }, [geoFilter])

  const getChargerColor = (chargerType: string): 'success' | 'warning' | 'error' | 'info' => {
    if (chargerType.includes('DC Fast')) return 'error'
    if (chargerType.includes('Level 2')) return 'warning'
    return 'info'
  }

  const getAvailabilityBadge = (status: string): { label: string; color: 'success' | 'warning' | 'error' | 'info'; icon: string } => {
    switch (status) {
      case 'available':
        return { label: '✓ Available Now', color: 'success', icon: '🟢' }
      case 'opens_soon':
        return { label: '⏰ Opens Soon', color: 'warning', icon: '🟡' }
      case 'closes_soon':
        return { label: '⏱️ Closes Soon', color: 'warning', icon: '🟡' }
      case 'closed':
        return { label: '✕ Closed', color: 'error', icon: '🔴' }
      default:
        return { label: 'Available', color: 'info', icon: '🔵' }
    }
  }

  const handleOpenReservation = async (listing: ListingData) => {
    setSelectedListing(listing)
    setOpenReservationModal(true)
    setCarouselIndex(0)
    setReservationDate('')
    setReservationTime('')
    setReservationDuration(1)
    setErrors({})
    setSubmitSuccess(false)
    setAvailableSlots([])
    setSelectedSlotId(null)
    setSlotsLoading(true)
    setSlotsError(null)
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/available/${listing.id}`)
      if (!res.ok) throw new Error('Failed to fetch available slots')
      const data = await res.json()
      setAvailableSlots(data)
    } catch (err: any) {
      setSlotsError(err.message || 'Could not load slots')
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleCloseReservation = () => {
    setOpenReservationModal(false)
    setSelectedListing(null)
    setErrors({})
    setSubmitSuccess(false)
  }

  const handlePrevImage = () => {
    if (selectedListing?.images) {
      setCarouselIndex((prev) => (prev === 0 ? selectedListing.images!.length - 1 : prev - 1))
    }
  }

  const handleNextImage = () => {
    if (selectedListing?.images) {
      setCarouselIndex((prev) => (prev === selectedListing.images!.length - 1 ? 0 : prev + 1))
    }
  }

  const estimatedCost = selectedListing ? selectedListing.pricePerHour * reservationDuration : 0

  const validateForm = (): boolean => {
    const newErrors: { date?: string; time?: string; duration?: string } = {}

    if (!reservationDate) {
      newErrors.date = 'Please select a date'
    } else {
      const selectedDate = new Date(reservationDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past'
      }
    }

    if (!reservationTime) {
      newErrors.time = 'Please select a time'
    }

    if (!reservationDuration || reservationDuration < 1) {
      newErrors.duration = 'Duration must be at least 1 hour'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirmReservation = async () => {
    if (!selectedSlotId || !selectedListing) {
      setErrors({ ...errors, slot: 'Please select a slot' })
      return
    }
    setErrors({})
    setSubmitSuccess(false)
    // Use hardcoded valid tenantId for testing
    const tenantId = '699188b3520a11c02a03e091';
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${selectedSlotId}/book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId })
      })
      if (!res.ok) throw new Error('Failed to book slot')
      setSubmitSuccess(true)
      setTimeout(() => {
        handleCloseReservation()
      }, 2000)
    } catch (err: any) {
      setErrors({ ...errors, slot: err.message || 'Booking failed' })
    }
  }

  const handleOpenExtendSession = () => {
    setOpenExtendSessionModal(true)
    setExtendSessionDuration(1)
  }

  const handleCloseExtendSession = () => {
    setOpenExtendSessionModal(false)
    setExtendSessionDuration(1)
  }

  const handleConfirmExtendSession = () => {
    if (!activeSession) return

    const extensionData = {
      sessionId: activeSession.sessionId,
      listingTitle: activeSession.listingTitle,
      extensionDuration: extendSessionDuration,
      additionalCost: (activeSession.pricePerHour / 60) * (extendSessionDuration * 60),
      newEndTime: new Date(Date.now() + (activeSession.timeRemainingMinutes + extendSessionDuration * 60) * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: new Date().toISOString(),
    }

    console.log('⏱️ SESSION EXTENSION SUBMITTED:', extensionData)
    console.table(extensionData)

    // Update active session with extended time
    const updatedSession = {
      ...activeSession,
      timeRemainingMinutes: activeSession.timeRemainingMinutes + extendSessionDuration * 60,
      endTime: extensionData.newEndTime,
      currentCost: activeSession.currentCost + extensionData.additionalCost,
    }
    setActiveSession(updatedSession)
    handleCloseExtendSession()
  }

  // Show loading and error for sanity test
  if (loading) return <Container maxWidth="lg" sx={{ py: 4 }}><Typography>Loading listings...</Typography></Container>;
  if (error) return <Container maxWidth="lg" sx={{ py: 4 }}><Typography color="error">{error}</Typography></Container>;
  return (
    <Container
      maxWidth={false}
      sx={{
        py: 3,
        px: { xs: 1, sm: 2, md: 4 },
        width: '80vw',
        maxWidth: '90vw',
        boxSizing: 'border-box',
      }}
    >
      {/* Upcoming Reservation Banner */}
      {upcomingReservation && showReservationBanner && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: `${colors.primary}15`,
            border: `2px solid ${colors.primary}`,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: colors.primary }}>
                📅 Upcoming Reservation
              </Typography>
              <Chip
                label="Confirmed"
                size="small"
                color="success"
                variant="filled"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" sx={{ color: colors.darkGray }}>
                  Charging Station
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600', color: colors.secondary }}>
                  {upcomingReservation.listingTitle}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.darkGray }}>
                  Date & Time
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600', color: colors.secondary }}>
                  {new Date(upcomingReservation.reservationDate).toLocaleDateString()} at {upcomingReservation.reservationTime}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.darkGray }}>
                  Duration
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600', color: colors.secondary }}>
                  {upcomingReservation.reservationDuration} hour{upcomingReservation.reservationDuration > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: colors.darkGray }}>
                  Cost
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: '600', color: colors.primary }}>
                  ${upcomingReservation.estimatedCost.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={() => setShowReservationBanner(false)}
            size="small"
            sx={{
              color: colors.primary,
              alignSelf: 'flex-start',
              mt: 0.5,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Paper>
      )}

      {/* Search Bar Section + Reload Button */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          backgroundColor: colors.white,
          borderTop: `3px solid ${colors.primary}`,
        }}
      >
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item xs={12} sm={10}>
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search locations..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        variant="text"
                        onClick={handleCurrentLocation}
                        sx={{
                          minWidth: '40px',
                          height: '32px',
                          color: colors.primary,
                          padding: '4px',
                          '&:hover': {
                            backgroundColor: 'rgba(19, 170, 82, 0.1)',
                          },
                        }}
                      >
                        <MyLocationIcon sx={{ fontSize: 20 }} />
                      </Button>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: 'rgba(19, 170, 82, 0.04)',
                    border: `1.5px solid ${colors.mediumGray}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(19, 170, 82, 0.08)',
                      borderColor: colors.primary,
                      boxShadow: `0 2px 8px rgba(19, 170, 82, 0.1)`,
                    },
                    '&.Mui-focused': {
                      backgroundColor: colors.white,
                      borderColor: colors.primary,
                      boxShadow: `0 4px 12px rgba(19, 170, 82, 0.15)`,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              {/* Suggestions dropdown */}
                            <Tooltip title="Reload Listings">
                              <IconButton onClick={handleReload} sx={{ ml: 1 }} color="primary" size="large" aria-label="reload-listings">
                                <RefreshIcon />
                              </IconButton>
                            </Tooltip>
              {locationSuggestions.length > 0 && (
                <Box sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: colors.white,
                  border: `1px solid ${colors.mediumGray}`,
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: '0 2px 8px rgba(19, 170, 82, 0.08)',
                  maxHeight: 200,
                  overflowY: 'auto',
                }}>
                  {locationSuggestions.map((loc) => (
                    <Box
                      key={loc.label}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        '&:hover': { background: 'rgba(19, 170, 82, 0.08)' },
                      }}
                      onClick={() => {
                        setSearchLocation(loc.label)
                        setGeoFilter({ latitude: loc.latitude, longitude: loc.longitude, radius: 5 })
                        setLocationSuggestions([])
                      }}
                    >
                      {loc.label}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              sx={{
                backgroundColor: colors.primary,
                '&:hover': {
                  backgroundColor: colors.primaryDark,
                },
                height: '40px',
              }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Map Section */}
      <MapComponent listings={listings} />

      {/* Results Count */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ color: colors.darkGray }}>
          Showing {listings.length} charging station{listings.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Listings Grid */}

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={listing.id || listing._id} sx={{ mb: 3, px: 2, display: 'flex', justifyContent: 'center' }}>
            <Card
              sx={{
                width: '100%',
                maxWidth: 340,
                minWidth: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(19, 170, 82, 0.15)',
                },
                overflow: 'hidden',
                border: `1px solid ${colors.mediumGray}`,
                margin: '0',
              }}
            >
              {/* Image Section removed */}

              {/* Header with gradient background */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary}15, ${colors.primaryLight})`,
                  p: 2.5,
                  borderBottom: `1px solid ${colors.mediumGray}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ElectricBoltIcon sx={{ color: colors.primary, fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.secondary, fontSize: '1rem' }}>
                      {listing.title}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', color: colors.primary, fontSize: '0.9rem' }}>
                  <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">
                    {typeof listing.location === 'string'
                      ? listing.location
                      : listing.location && (listing.location.address || listing.location.city || listing.location.state || listing.location.country || '')}
                  </Typography>
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1, pb: 1, pt: 1.5, px: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Price and Info - Two Column Layout */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  {/* Left: Price - Compact */}
                  <Box
                    sx={{
                      background: `linear-gradient(135deg, ${colors.primaryLight}, ${colors.white})`,
                      p: 1,
                      borderRadius: 1,
                      border: `2px solid ${colors.primary}`,
                      textAlign: 'center',
                      minWidth: '80px',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.darkGray, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '600', display: 'block' }}>
                      per hour
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 'bold',
                        color: colors.primary,
                        fontSize: '1.3rem',
                      }}
                    >
                      ${listing.pricePerHour.toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Right: Details */}
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {/* Distance and Charger Type */}
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {listing.distance && (
                        <Chip
                          label={`📍 ${listing.distance}`}
                          size="small"
                          variant="outlined"
                          sx={{
                            color: colors.primary,
                            borderColor: colors.primary,
                            backgroundColor: 'rgba(19, 170, 82, 0.05)',
                            fontSize: '0.8rem',
                          }}
                        />
                      )}
                      <Chip
                        label={listing.chargerType}
                        size="small"
                        color={getChargerColor(listing.chargerType)}
                        variant="filled"
                        sx={{
                          fontWeight: '500',
                          fontSize: '0.8rem',
                        }}
                      />
                    </Box>

                    {/* Rating */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <Rating value={listing.rating} readOnly size="small" />
                      <Typography variant="caption" sx={{ color: colors.darkGray, fontWeight: '500', fontSize: '0.75rem' }}>
                        {listing.rating}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.darkGray, fontSize: '0.75rem' }}>
                        ({listing.reviews})
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ pt: 1, px: 1.5, pb: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!listing.available}
                  onClick={() => handleOpenReservation(listing)}
                  sx={{
                    backgroundColor: listing.available ? colors.primary : '#ccc',
                    color: 'white',
                    fontWeight: '600',
                    py: 0.8,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: listing.available ? colors.primaryDark : '#ccc',
                      transform: listing.available ? 'scale(1.02)' : 'none',
                    },
                  }}
                >
                  {listing.available ? 'Reserve Now' : 'Unavailable'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {listings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ color: colors.darkGray }}>
            No charging stations found in that location.
          </Typography>
          <Button
            variant="text"
            onClick={() => {
              setSearchLocation('')
              setListings(listings)
            }}
            sx={{ mt: 2, color: colors.primary }}
          >
            View All Listings
          </Button>
        </Box>
      )}

      {/* Reservation Modal */}
      <Dialog open={openReservationModal} onClose={handleCloseReservation} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, fontWeight: 'bold', color: colors.secondary }}>
          Reserve {selectedListing?.title}
          <IconButton onClick={handleCloseReservation} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {selectedListing && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Image Carousel removed */}

              {/* Listing Details */}
              <Box sx={{ borderTop: `1px solid ${colors.mediumGray}`, pt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {selectedListing.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: colors.primary }}>
                  <LocationOnIcon sx={{ fontSize: 18 }} />
                  <Typography variant="body2">{selectedListing.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Chip label={selectedListing.chargerType} color="primary" variant="filled" />
                  <Chip
                    label={`${selectedListing.rating} ⭐ (${selectedListing.reviews} reviews)`}
                    variant="outlined"
                  />
                </Box>
              </Box>

              {/* Slot Selection UI */}
              <Box sx={{ borderTop: `1px solid ${colors.mediumGray}`, pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  Select an Available Slot
                </Typography>
                {slotsLoading && <Typography>Loading slots...</Typography>}
                {slotsError && <Alert severity="error">{slotsError}</Alert>}
                {!slotsLoading && !slotsError && availableSlots.length === 0 && (
                  <Typography>No available slots for this listing.</Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 250, overflowY: 'auto', mb: 2 }}>
                  {availableSlots.map(slot => (
                    <Box
                      key={slot._id}
                      sx={{
                        border: `2px solid ${selectedSlotId === slot._id ? colors.primary : colors.mediumGray}`,
                        borderRadius: 2,
                        p: 1.5,
                        background: selectedSlotId === slot._id ? `${colors.primary}10` : colors.white,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                      onClick={() => setSelectedSlotId(slot._id)}
                    >
                      <Typography sx={{ fontWeight: 600, color: colors.secondary }}>
                        {new Date(slot.date).toLocaleDateString()} {slot.reservedStartTime} - {slot.reservedEndTime}
                      </Typography>
                      {selectedSlotId === slot._id && <Chip label="Selected" color="primary" size="small" />}
                    </Box>
                  ))}
                </Box>
                {errors.slot && (
                  <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
                    {errors.slot}
                  </Typography>
                )}
                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✓ Reservation submitted successfully!
                  </Alert>
                )}
              </Box>

              {/* Cost Breakdown */}
              <Box
                sx={{
                  borderTop: `1px solid ${colors.mediumGray}`,
                  pt: 2,
                  backgroundColor: `${colors.primary}10`,
                  p: 1.5,
                  borderRadius: 1,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    ${selectedListing.pricePerHour.toFixed(2)} × {reservationDuration}h
                  </Typography>
                  <Typography variant="body2">${estimatedCost.toFixed(2)}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Estimated Total:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: colors.primary }}>
                    ${estimatedCost.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCloseReservation}
            variant="outlined"
            disabled={submitSuccess}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmReservation}
            variant="contained"
            disabled={submitSuccess}
            sx={{
              backgroundColor: colors.primary,
              '&:disabled': {
                backgroundColor: '#ccc',
              },
            }}
          >
            {submitSuccess ? '✓ Reservation Submitted' : 'Confirm Reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
