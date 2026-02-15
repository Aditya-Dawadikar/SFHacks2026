import { useEffect, useState } from 'react'
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
  CircularProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface Reservation {
  _id: string;
  tenantId: { firstName: string; lastName: string } | string;
  listingId: { title: string } | string;
  date: string;
  reservedStartTime: string;
  reservedEndTime: string;
  status: string;
}

const OWNER_ID = '699188b2520a11c02a03e088'; // Hardcoded for demo

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/reservations/owner/${OWNER_ID}`);
        if (!res.ok) throw new Error('Failed to fetch reservations');
        const data = await res.json();
        setReservations(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
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
              {reservations.map((reservation) => {
                const tenantName = typeof reservation.tenantId === 'object' ? `${reservation.tenantId.firstName} ${reservation.tenantId.lastName}` : reservation.tenantId;
                const listingTitle = typeof reservation.listingId === 'object' ? reservation.listingId.title : reservation.listingId;
                const duration = (() => {
                  // Calculate duration in minutes
                  const [sh, sm] = reservation.reservedStartTime.split(':').map(Number);
                  const [eh, em] = reservation.reservedEndTime.split(':').map(Number);
                  let mins = (eh * 60 + em) - (sh * 60 + sm);
                  if (mins < 0) mins += 24 * 60;
                  return mins >= 60 ? `${(mins / 60).toFixed(1)} hours` : `${mins} min`;
                })();
                return (
                  <TableRow key={reservation._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell sx={{ fontWeight: '600' }}>{tenantName}</TableCell>
                    <TableCell>{listingTitle}</TableCell>
                    <TableCell>{new Date(reservation.date).toLocaleDateString()}</TableCell>
                    <TableCell>{reservation.reservedStartTime} - {reservation.reservedEndTime}</TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell>
                      <Chip
                        label={reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        color={getStatusColor(reservation.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="textSecondary">
                        —
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  )
}
