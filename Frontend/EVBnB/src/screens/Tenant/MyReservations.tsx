import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress } from '@mui/material'
import BreadcrumbNav from '../../components/BreadcrumbNav'
import { colors } from '../../theme/colors'
import { useEffect, useState } from 'react'

interface Reservation {
  _id: string;
  listingId: { title: string; location: any } | string;
  date: string;
  reservedStartTime: string;
  reservedEndTime: string;
  status: string;
  price: number;
}

const TENANT_ID = '699188b3520a11c02a03e091'; // Hardcoded for demo

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
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/reservations/tenant/${TENANT_ID}`);
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
          { label: 'Browse Listings', onClick: () => onNavigate('browse') },
          { label: 'My Reservations', isActive: true },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: colors.secondary }}>
        My Reservations
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
              {reservations.map((reservation) => {
                const station = typeof reservation.listingId === 'object' ? reservation.listingId.title : reservation.listingId;
                const location = typeof reservation.listingId === 'object' ? (reservation.listingId.location?.address || reservation.listingId.location?.city || '') : '';
                const duration = (() => {
                  // Calculate duration in minutes
                  const [sh, sm] = reservation.reservedStartTime.split(':').map(Number);
                  const [eh, em] = reservation.reservedEndTime.split(':').map(Number);
                  let mins = (eh * 60 + em) - (sh * 60 + sm);
                  if (mins < 0) mins += 24 * 60;
                  return mins >= 60 ? `${(mins / 60).toFixed(1)} hours` : `${mins} min`;
                })();
                return (
                  <TableRow key={reservation._id}>
                    <TableCell>{station}</TableCell>
                    <TableCell>{location}</TableCell>
                    <TableCell>
                      {new Date(reservation.date).toLocaleDateString()} @ {reservation.reservedStartTime}
                    </TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: colors.primary }}>${reservation.price?.toFixed(2) ?? '-'}</TableCell>
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
                      {reservation.status === 'reserved' && (
                        <Button size="small" color="primary">
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
