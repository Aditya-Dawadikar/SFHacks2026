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
} from '@mui/material'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface HistoryRecord {
  id: string
  date: string
  type: string
  description: string
  amount: string
  status: 'completed' | 'pending' | 'cancelled'
}

const mockHistory: HistoryRecord[] = [
  {
    id: '1',
    date: '2026-02-13',
    type: 'Reservation',
    description: 'John Doe reserved Charging Spot #1',
    amount: '$45.00',
    status: 'completed',
  },
  {
    id: '2',
    date: '2026-02-12',
    type: 'Reservation',
    description: 'Alice Smith reserved Charging Spot #2',
    amount: '$60.00',
    status: 'completed',
  },
  {
    id: '3',
    date: '2026-02-11',
    type: 'Payout',
    description: 'Monthly payout processed',
    amount: '$450.00',
    status: 'completed',
  },
  {
    id: '4',
    date: '2026-02-10',
    type: 'Cancellation',
    description: 'Reservation cancelled by Bob Johnson',
    amount: '-$30.00',
    status: 'cancelled',
  },
  {
    id: '5',
    date: '2026-02-09',
    type: 'Reservation',
    description: 'Carol White reserved Charging Spot #1',
    amount: '$45.00',
    status: 'pending',
  },
]

function getStatusColor(status: string): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'success'
  }
}

interface OwnerHistoryProps {
  onNavigate: (page: string) => void
}

export default function OwnerHistory({ onNavigate }: OwnerHistoryProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'History', isActive: true },
        ]}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                Amount
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockHistory.map((record) => (
              <TableRow key={record.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: '600' }}>
                    {record.type}
                  </Typography>
                </TableCell>
                <TableCell>{record.description}</TableCell>
                <TableCell align="right" sx={{ fontWeight: '600', color: '#4caf50' }}>
                  {record.amount}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    color={getStatusColor(record.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
