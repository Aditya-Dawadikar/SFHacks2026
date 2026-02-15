import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert, Grid } from '@mui/material';
import BreadcrumbNav from '../../components/BreadcrumbNav';

interface Schedule {
  _id: string;
  openingTime: string;
  closingTime: string;
  isAvailable: boolean;
  isBlocked: boolean;
  blockReason?: string;
  minSessionDuration?: number;
  maxSessionDuration?: number;
  createdAt: string;
}

export default function ListingSchedules() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingTitle, setListingTitle] = useState<string>('');

  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/schedules/listing/${listingId}`);
        if (!res.ok) throw new Error('Failed to fetch schedules');
        const data = await res.json();
        setSchedules(data);
        // Optionally fetch listing title
        if (data.length > 0 && data[0].listingId && data[0].listingId.title) {
          setListingTitle(data[0].listingId.title);
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [listingId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => navigate('/owner/dashboard') },
          { label: 'Listing Schedules', isActive: true },
        ]}
      />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Schedules for Listing
      </Typography>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <Grid container spacing={3}>
          {schedules.length === 0 ? (
            <Typography>No schedules found for this listing.</Typography>
          ) : (
            schedules.map((schedule) => (
              <Grid item xs={12} md={6} lg={4} key={schedule._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{schedule.openingTime} - {schedule.closingTime}</Typography>
                    <Typography>Available: {schedule.isAvailable ? 'Yes' : 'No'}</Typography>
                    <Typography>Blocked: {schedule.isBlocked ? 'Yes' : 'No'}</Typography>
                    {schedule.isBlocked && schedule.blockReason && (
                      <Typography>Block Reason: {schedule.blockReason}</Typography>
                    )}
                    <Typography>Min Session: {schedule.minSessionDuration}h</Typography>
                    <Typography>Max Session: {schedule.maxSessionDuration}h</Typography>
                    <Typography variant="caption" color="textSecondary">
                      Created: {new Date(schedule.createdAt).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}
