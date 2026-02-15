import { Box, Container, Typography, Card, CardContent, Grid, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Checkbox, Alert, Tabs, Tab } from '@mui/material'
import ListingSchedulesTab from './ListingSchedulesTab';
import { useRef } from 'react'
import { useEffect, useState } from 'react'
import BuildIcon from '@mui/icons-material/Build'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SettingsIcon from '@mui/icons-material/Settings'

interface OwnerDashboardProps {
  onNavigate: (page: string) => void
}

export default function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  // Hardcoded user info
  const user = {
    owner: {
      totalListings: 0,
      rating: 0,
      totalEarnings: 0,
      isVerified: false,
    },
    tenant: {
      totalSessions: 0,
      rating: 0,
      totalSpent: 0,
      subscriptionLevel: 'basic',
    },
    _id: '699188b2520a11c02a03e088',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice.owner@example.com',
    phone: '555-1234',
    userType: 'owner',
    createdAt: '2026-02-15T08:49:54.285Z',
    updatedAt: '2026-02-15T08:49:54.286Z',
    __v: 0,
  };
  const OWNER_ID = user._id;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'schedules'>('dashboard');
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

  
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    listingId: '',
    ownerId: OWNER_ID,
    openingTime: '',
    closingTime: '',
    isAvailable: true,
    isBlocked: false,
    blockReason: '',
    minSessionDuration: 1,
    maxSessionDuration: 12,
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string|null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/api/listings/owner/${OWNER_ID}`);
        if (!res.ok) throw new Error('Failed to fetch listings');
        const data = await res.json();
        setListings(data.listings || []);
        // Optionally update stats
        user.owner.totalListings = (data.listings || []).length;
        user.owner.rating = data.listings && data.listings.length > 0 ? (data.listings.reduce((sum: number, l: any) => sum + (l.rating || 0), 0) / data.listings.length) : 0;
        user.owner.totalEarnings = data.listings ? data.listings.reduce((sum: number, l: any) => sum + (l.totalEarnings || 0), 0) : 0;
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Welcome, {user.firstName} {user.lastName}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" color="textSecondary">
          Email: {user.email}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Phone: {user.phone}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Owner Stats */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Your Stats</Typography>
              <Typography>Total Listings: {user.owner.totalListings}</Typography>
              <Typography>Rating: {user.owner.rating?.toFixed(2)}</Typography>
              <Typography>Total Earnings: ${user.owner.totalEarnings?.toFixed(2)}</Typography>
              <Typography>Verified: {user.owner.isVerified ? 'Yes' : 'No'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Contact Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Contact Info</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>Phone: {user.phone}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* Account Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Account Info</Typography>
              <Typography>User Type: {user.userType}</Typography>
              <Typography>Joined: {new Date(user.createdAt).toLocaleDateString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Listings Section */}
      <Box mt={5}>
        <Typography variant="h5" gutterBottom>
          Your Listings
        </Typography>
        {activeTab === 'dashboard' && (
          loading ? (
            <Typography>Loading listings...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : listings.length === 0 ? (
            <Typography>No listings found.</Typography>
          ) : (
            <Grid container spacing={3}>
              {listings.map((listing) => (
                <Grid item xs={12} md={6} lg={4} key={listing._id}>
                  <Card
                    sx={{ cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}
                    onClick={() => {
                      setSelectedListingId(listing._id);
                      setActiveTab('schedules');
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{listing.title}</Typography>
                      <Typography>{listing.description}</Typography>
                      <Typography>Type: {listing.chargerType}</Typography>
                      <Typography>Price: ${listing.pricePerHour}/hr</Typography>
                      <Typography>Location: {listing.location?.address || 'N/A'}</Typography>
                      <Typography>Active: {listing.isActive ? 'Yes' : 'No'}</Typography>
                      <Box mt={2}>
                        <Button
                          variant="contained"
                          onClick={e => {
                            e.stopPropagation();
                            setScheduleForm({
                              listingId: listing._id,
                              ownerId: OWNER_ID,
                              openingTime: '',
                              closingTime: '',
                              isAvailable: true,
                              isBlocked: false,
                              blockReason: '',
                              minSessionDuration: 1,
                              maxSessionDuration: 12,
                            });
                            setScheduleDialogOpen(true);
                          }}
                        >
                          Schedule
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )
        )}
        {activeTab === 'schedules' && selectedListingId && (
          <ListingSchedulesTab
            listingId={selectedListingId}
            listing={listings.find(l => l._id === selectedListingId)}
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </Box>
    </Container>
  );
}
