import {
  Container,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface Listing {
  _id: string
  title: string
  description: string;
  location: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  chargerType: string
  pricePerHour: number
  isActive: boolean
}

const OWNER_ID = '699188b2520a11c02a03e088'; // Hardcoded for demo

interface ManageListingsProps {
  onNavigate: (page: string) => void

};

export default function ManageListings({ onNavigate }: ManageListingsProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    chargerType: 'Level 2',
    pricePerHour: '',
  })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenDialog = (listing?: Listing) => {
    if (listing) {
      setEditingId(listing._id)
      setFormData({
        title: listing.title,
        description: listing.description || '',
        address: listing.location.address,
        city: listing.location.city,
        state: listing.location.state,
        zipCode: listing.location.zipCode,
        country: listing.location.country,
        chargerType: listing.chargerType,
        pricePerHour: listing.pricePerHour.toString(),
      })
    } else {
      setEditingId(null)
      setFormData({ title: '', description: '', address: '', city: '', state: '', zipCode: '', country: '', chargerType: 'Level 2', pricePerHour: '' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map chargerType to valid enum
      let chargerType = formData.chargerType;
      if (chargerType === 'DC Fast') chargerType = 'DC Fast Charging';
      const payload = {
        title: formData.title,
        description: formData.description || 'A new listing',
        ownerId: OWNER_ID,
        chargerType,
        pricePerHour: Number(formData.pricePerHour),
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      };
      // Validate required fields
      if (!payload.title || !payload.description || !payload.ownerId || !payload.chargerType || isNaN(payload.pricePerHour) || !payload.startTime || !payload.endTime) {
        setError('Please fill all required fields.');
        setLoading(false);
        return;
      }
      let res;
      if (editingId) {
        // Edit mode: update listing
        res = await fetch(`http://localhost:5000/api/listings/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create mode: create new listing
        res = await fetch('http://localhost:5000/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save listing');
      }
      await fetchListings();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch listings for owner
  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/listings/owner/${OWNER_ID}`);
      if (!res.ok) throw new Error('Failed to fetch listings');
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Manage Listings', isActive: true },
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Manage Listings
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add New Listing
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Charger Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Price/Hour</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing._id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <TableCell sx={{ fontWeight: '600' }}>{listing.title}</TableCell>
                  <TableCell>{[listing.location.address, listing.location.city, listing.location.state].filter(Boolean).join(', ')}</TableCell>
                  <TableCell>{listing.chargerType}</TableCell>
                  <TableCell sx={{ color: '#4caf50', fontWeight: '600' }}>${listing.pricePerHour.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={listing.isActive ? 'Active' : 'Inactive'}
                      color={listing.isActive ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(listing)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={async () => {
                        setLoading(true);
                        setError(null);
                        try {
                          const res = await fetch(`http://localhost:5000/api/listings/${listing._id}`, {
                            method: 'DELETE',
                          });
                          if (!res.ok) {
                            const errData = await res.json();
                            throw new Error(errData.error || 'Failed to delete listing');
                          }
                          await fetchListings();
                        } catch (err: any) {
                          setError(err.message || 'Unknown error');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog for Add/Edit Listing */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
          />
          <TextField
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            fullWidth
          />
          <TextField
            label="State"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            fullWidth
          />
          <TextField
            label="Zip Code"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            fullWidth
          />
          <TextField
            label="Country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Charger Type</InputLabel>
            <Select
              value={formData.chargerType}
              label="Charger Type"
              onChange={(e) => setFormData({ ...formData, chargerType: e.target.value })}
            >
              <MenuItem value="Level 1">Level 1</MenuItem>
              <MenuItem value="Level 2">Level 2</MenuItem>
              <MenuItem value="DC Fast Charging">DC Fast Charging</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Price Per Hour ($)"
            type="number"
            value={formData.pricePerHour}
            onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
