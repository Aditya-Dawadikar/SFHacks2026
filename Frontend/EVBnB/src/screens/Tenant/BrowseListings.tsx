import { useState } from 'react'
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
} from '@mui/material'
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

const mockListings: ListingData[] = [
  {
    id: '1',
    title: 'Fast Charger Downtown',
    location: 'Downtown, San Francisco',
    chargerType: 'DC Fast Charger',
    pricePerHour: 8.5,
    rating: 4.8,
    reviews: 125,
    available: true,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1591290621749-2bffb66fa0cb?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1591290621749-2bffb66fa0cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560958089-b8a63dd89c94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593642632823-8b785cb33842?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'available',
    lat: 37.7949,
    lng: -122.3977,
  },
  {
    id: '2',
    title: 'Level 2 Parking Lot',
    location: 'Mission District, San Francisco',
    chargerType: 'Level 2',
    pricePerHour: 3.5,
    rating: 4.6,
    reviews: 87,
    available: true,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1593642632823-8b785cb33842?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8b785cb33842?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600373422634-7f4233124b94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1629645290559-f814de99e1c9?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'closes_soon',
    lat: 37.7599,
    lng: -122.4148,
  },
  {
    id: '3',
    title: 'Premium Fast Charge',
    location: 'Financial District, San Francisco',
    chargerType: 'DC Fast Charger',
    pricePerHour: 9.5,
    rating: 4.9,
    reviews: 256,
    available: true,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1560958089-b8a63dd89c94?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a63dd89c94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591290621749-2bffb66fa0cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600373422634-7f4233124b94?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'available',
    lat: 37.7942,
    lng: -122.3962,
  },
  {
    id: '4',
    title: 'Convenient Level 2',
    location: 'Marina District, San Francisco',
    chargerType: 'Level 2',
    pricePerHour: 4.0,
    rating: 4.4,
    reviews: 65,
    available: false,
    distance: '1.5 km',
    image: 'https://images.unsplash.com/photo-1629645290559-f814de99e1c9?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1629645290559-f814de99e1c9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593642632823-8b785cb33842?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560958089-b8a63dd89c94?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'closed',
    lat: 37.8044,
    lng: -122.4335,
  },
  {
    id: '5',
    title: 'Community Charging Hub',
    location: 'Castro Valley, San Francisco',
    chargerType: 'Level 1 & 2',
    pricePerHour: 2.5,
    rating: 4.3,
    reviews: 92,
    available: true,
    distance: '3.2 km',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1591290621749-2bffb66fa0cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1629645290559-f814de99e1c9?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'opens_soon',
    lat: 37.6688,
    lng: -122.0808,
  },
  {
    id: '6',
    title: 'Ultra-Fast DC Station',
    location: 'South Bay, San Francisco',
    chargerType: 'DC Fast Charger',
    pricePerHour: 10.0,
    rating: 4.7,
    reviews: 189,
    available: true,
    distance: '2.1 km',
    image: 'https://images.unsplash.com/photo-1600373422634-7f4233124b94?w=500&h=300&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1600373422634-7f4233124b94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560958089-b8a63dd89c94?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593642632823-8b785cb33842?w=800&h=600&fit=crop',
    ],
    availabilityStatus: 'available',
    lat: 37.5485,
    lng: -122.2471,
  },
]

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
  const [listings, setListings] = useState(mockListings)
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

  const handleSearch = () => {
    if (searchLocation.trim()) {
      // Filter listings by location
      const filtered = mockListings.filter((listing) =>
        listing.location.toLowerCase().includes(searchLocation.toLowerCase()),
      )
      setListings(filtered.length > 0 ? filtered : mockListings)
    } else {
      setListings(mockListings)
    }
  }

  const handleCurrentLocation = () => {
    // Simulate getting current location
    setSearchLocation('San Francisco')
    setListings(mockListings)
  }

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

  const handleOpenReservation = (listing: ListingData) => {
    setSelectedListing(listing)
    setOpenReservationModal(true)
    setCarouselIndex(0)
    setReservationDate(new Date().toISOString().split('T')[0])
    setReservationTime('10:00')
    setReservationDuration(1)
    setErrors({})
    setSubmitSuccess(false)
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

  const handleConfirmReservation = () => {
    if (!validateForm()) {
      return
    }

    if (selectedListing) {
      const reservationData = {
        listingId: selectedListing.id,
        listingTitle: selectedListing.title,
        listingLocation: selectedListing.location,
        chargerType: selectedListing.chargerType,
        pricePerHour: selectedListing.pricePerHour,
        reservationDate,
        reservationTime,
        reservationDuration,
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
        timestamp: new Date().toISOString(),
      }

      console.log('📋 RESERVATION SUBMITTED:', reservationData)
      console.table(reservationData)

      // Save upcoming reservation
      const upcomingRes: UpcomingReservation = {
        listingId: selectedListing.id,
        listingTitle: selectedListing.title,
        listingLocation: selectedListing.location,
        reservationDate,
        reservationTime,
        reservationDuration,
        estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      }
      setUpcomingReservation(upcomingRes)
      setShowReservationBanner(true)

      setSubmitSuccess(true)
      setTimeout(() => {
        handleCloseReservation()
      }, 2000)
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

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
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

      {/* Search Bar Section */}
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
      <Grid container spacing={2}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={4} md={3} key={listing.id}>
            <Card
              sx={{
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
              }}
            >
              {/* Image Section */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '150px',
                  overflow: 'hidden',
                  backgroundColor: colors.lightGray,
                }}
              >
                <Box
                  component="img"
                  src={listing.image}
                  alt={listing.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1591290621749-2bffb66fa0cb?w=500&h=300&fit=crop'
                  }}
                />
                {/* Availability Badge - Overlaid on image */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 10,
                  }}
                >
                  <Chip
                    label={getAvailabilityBadge(listing.availabilityStatus).label}
                    color={getAvailabilityBadge(listing.availabilityStatus).color}
                    variant="filled"
                    sx={{
                      fontWeight: '600',
                      fontSize: '0.85rem',
                    }}
                  />
                </Box>
                {/* Availability overlay tint */}
                {!listing.available && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    }}
                  />
                )}
              </Box>

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
                  <Typography variant="body2">{listing.location}</Typography>
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
              setListings(mockListings)
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
              {/* Image Carousel */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={selectedListing.images?.[carouselIndex] || selectedListing.image}
                  alt={`${selectedListing.title} - Image ${carouselIndex + 1}`}
                  sx={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
                {selectedListing.images && selectedListing.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                      onClick={handleNextImage}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                    {/* Image Counter */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.85rem',
                      }}
                    >
                      {carouselIndex + 1} / {selectedListing.images.length}
                    </Typography>
                  </>
                )}
              </Box>

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

              {/* Date, Time, Duration Selection */}
              <Box sx={{ borderTop: `1px solid ${colors.mediumGray}`, pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1.5 }}>
                  Reservation Details
                </Typography>

                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    ✓ Reservation submitted successfully! Check your browser console for details.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box>
                    <TextField
                      label="Date"
                      type="date"
                      value={reservationDate || ''}
                      onChange={(e) => {
                        const newDate = e.target.value
                        setReservationDate(newDate)
                        if (errors.date) setErrors({ ...errors, date: undefined })
                      }}
                      onBlur={() => {
                        // Trigger validation on blur
                        if (reservationDate) validateForm()
                      }}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.date}
                      helperText={errors.date || 'Select today or future date'}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0],
                      }}
                    />
                  </Box>

                  <Box>
                    <TextField
                      label="Time"
                      type="time"
                      value={reservationTime || '10:00'}
                      onChange={(e) => {
                        const newTime = e.target.value
                        setReservationTime(newTime)
                        if (errors.time) setErrors({ ...errors, time: undefined })
                      }}
                      onBlur={() => {
                        // Trigger validation on blur
                        if (reservationTime) validateForm()
                      }}
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.time}
                      helperText={errors.time || 'Select a time'}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.75 }}>
                      Duration
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const newDuration = Math.max(1, reservationDuration - 1)
                          setReservationDuration(newDuration)
                          if (errors.duration) setErrors({ ...errors, duration: undefined })
                        }}
                        sx={{ minWidth: '40px' }}
                      >
                        −
                      </Button>
                      <TextField
                        value={reservationDuration}
                        onChange={(e) => {
                          const value = Math.max(1, parseInt(e.target.value) || 1)
                          setReservationDuration(value)
                          if (errors.duration) setErrors({ ...errors, duration: undefined })
                        }}
                        type="number"
                        inputProps={{ min: 1, step: 1, style: { textAlign: 'center' } }}
                        sx={{ width: '70px' }}
                        size="small"
                      />
                      <Typography variant="body2" sx={{ minWidth: '50px' }}>
                        hours
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const newDuration = reservationDuration + 1
                          setReservationDuration(newDuration)
                          if (errors.duration) setErrors({ ...errors, duration: undefined })
                        }}
                        sx={{ minWidth: '40px' }}
                      >
                        +
                      </Button>
                    </Box>
                    {errors.duration && (
                      <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 0.5 }}>
                        {errors.duration}
                      </Typography>
                    )}
                  </Box>
                </Box>
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
