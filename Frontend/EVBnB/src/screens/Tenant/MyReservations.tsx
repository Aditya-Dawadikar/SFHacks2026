import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button } from '@mui/material'
import BreadcrumbNav from '../../components/BreadcrumbNav'
import { colors } from '../../theme/colors'

interface Reservation {
  id: string
  chargingStation: string
  location: string
  date: string
  time: string
  duration: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  price: string
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    chargingStation: 'Fast Charger Downtown',
    location: 'Downtown, San Francisco',
    date: '2026-02-15',
    time: '10:00 AM',
    duration: '2 hours',
    status: 'confirmed',
    price: '$17.00',
  },
  {
    id: '2',
    chargingStation: 'Level 2 Parking Lot',
    location: 'Mission District, San Francisco',
    date: '2026-02-16',
    time: '02:00 PM',
    duration: '1.5 hours',
    status: 'pending',
    price: '$5.25',
  },
  {
    id: '3',
    chargingStation: 'Premium Fast Charge',
    location: 'Financial District, San Francisco',
    date: '2026-02-10',
    time: '08:00 AM',
    duration: '2.5 hours',
    status: 'completed',
    price: '$23.75',
  },
]

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'info'
    case 'cancelled':
      return 'error'
    default:
      return 'info'
  }
}

interface MyReservationsProps {
  onNavigate: (page: string) => void
}

export default function MyReservations({ onNavigate }: MyReservationsProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Browse Listings', onClick: () => onNavigate('browse') },
          { label: 'My Reservations', isActive: true },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: colors.secondary }}>
        My Reservations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Station</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date & Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.chargingStation}</TableCell>
                <TableCell>{reservation.location}</TableCell>
                <TableCell>
                  {reservation.date} @ {reservation.time}
                </TableCell>
                <TableCell>{reservation.duration}</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: colors.primary }}>{reservation.price}</TableCell>
                <TableCell>
                  <Chip
                    label={reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    color={getStatusColor(reservation.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {reservation.status === 'pending' && (
                    <Button size="small" color="error">
                      Cancel
                    </Button>
                  )}
                  {reservation.status === 'confirmed' && (
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
