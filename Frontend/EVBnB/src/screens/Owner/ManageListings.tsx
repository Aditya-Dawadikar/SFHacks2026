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
} from '@mui/material'
import { useState } from 'react'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface Listing {
  id: string
  title: string
  location: string
  chargerType: string
  pricePerHour: string
  status: 'active' | 'inactive'
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Downtown Charging Hub',
    location: 'Main Street, City',
    chargerType: 'Level 2',
    pricePerHour: '$5.00',
    status: 'active',
  },
  {
    id: '2',
    title: 'Airport Spot',
    location: 'Airport Rd, Terminal 2',
    chargerType: 'DC Fast',
    pricePerHour: '$8.00',
    status: 'active',
  },
  {
    id: '3',
    title: 'Mall Parking',
    location: 'Shopping Mall, Lot B',
    chargerType: 'Level 2',
    pricePerHour: '$4.00',
    status: 'inactive',
  },
]

interface ManageListingsProps {
  onNavigate: (page: string) => void
}

export default function ManageListings({ onNavigate }: ManageListingsProps) {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    chargerType: 'Level 2',
    pricePerHour: '',
  })

  const handleOpenDialog = (listing?: Listing) => {
    if (listing) {
      setEditingId(listing.id)
      setFormData({
        title: listing.title,
        location: listing.location,
        chargerType: listing.chargerType,
        pricePerHour: listing.pricePerHour.replace('$', '').replace('.00', ''),
      })
    } else {
      setEditingId(null)
      setFormData({ title: '', location: '', chargerType: 'Level 2', pricePerHour: '' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const handleSave = () => {
    console.log('Saving listing:', formData)
    handleCloseDialog()
  }

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
            {mockListings.map((listing) => (
              <TableRow key={listing.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell sx={{ fontWeight: '600' }}>{listing.title}</TableCell>
                <TableCell>{listing.location}</TableCell>
                <TableCell>{listing.chargerType}</TableCell>
                <TableCell sx={{ color: '#4caf50', fontWeight: '600' }}>{listing.pricePerHour}</TableCell>
                <TableCell>
                  <Chip
                    label={listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    color={listing.status === 'active' ? 'success' : 'default'}
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
                  <Button size="small" startIcon={<DeleteIcon />} color="error">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for Add/Edit Listing */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Listing' : 'Add New Listing'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
          />
          <TextField
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
              <MenuItem value="DC Fast">DC Fast Charging</MenuItem>
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
