import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Box,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface Reservation {
  id: string
  tenantName: string
  listingTitle: string
  date: string
  time: string
  duration: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

const mockReservations: Reservation[] = [
  {
    id: '1',
    tenantName: 'John Doe',
    listingTitle: 'Downtown Charging Hub',
    date: '2026-02-14',
    time: '10:00 AM - 12:00 PM',
    duration: '2 hours',
    status: 'pending',
  },
  {
    id: '2',
    tenantName: 'Alice Smith',
    listingTitle: 'Airport Spot',
    date: '2026-02-14',
    time: '2:00 PM - 5:00 PM',
    duration: '3 hours',
    status: 'confirmed',
  },
  {
    id: '3',
    tenantName: 'Bob Johnson',
    listingTitle: 'Downtown Charging Hub',
    date: '2026-02-13',
    time: '9:00 AM - 11:00 AM',
    duration: '2 hours',
    status: 'completed',
  },
  {
    id: '4',
    tenantName: 'Carol White',
    listingTitle: 'Mall Parking',
    date: '2026-02-12',
    time: '3:00 PM - 4:00 PM',
    duration: '1 hour',
    status: 'cancelled',
  },
]

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'completed':
      return 'success'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

interface ViewReservationsProps {
  onNavigate: (page: string) => void
}

export default function ViewReservations({ onNavigate }: ViewReservationsProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'View Reservations', isActive: true },
        ]}
      />

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Reservations
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Tenant Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Listing</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockReservations.map((reservation) => (
              <TableRow key={reservation.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell sx={{ fontWeight: '600' }}>{reservation.tenantName}</TableCell>
                <TableCell>{reservation.listingTitle}</TableCell>
                <TableCell>{reservation.date}</TableCell>
                <TableCell>{reservation.time}</TableCell>
                <TableCell>{reservation.duration}</TableCell>
                <TableCell>
                  <Chip
                    label={reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    color={getStatusColor(reservation.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  {reservation.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CancelIcon />}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                  {reservation.status !== 'pending' && (
                    <Typography variant="body2" color="textSecondary">
                      —
                    </Typography>
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
