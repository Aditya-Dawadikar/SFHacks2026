import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import BreadcrumbNav from '../../components/BreadcrumbNav'
import { colors } from '../../theme/colors'

interface Payment {
  id: string
  date: string
  chargingStation: string
  energyUsed: string
  durationCharge: string
  energyCharge: string
  platformFee: string
  taxAmount: string
  totalAmount: string
  status: 'completed' | 'pending' | 'failed'
  paymentMethod: string
}

const mockPayments: Payment[] = [
  {
    id: '1',
    date: '2026-02-12',
    chargingStation: 'Level 2 Parking Lot',
    energyUsed: '22 kWh',
    durationCharge: '$3.50',
    energyCharge: '$4.40',
    platformFee: '$0.50',
    taxAmount: '$0.80',
    totalAmount: '$9.20',
    status: 'completed',
    paymentMethod: 'Credit Card ****1234',
  },
  {
    id: '2',
    date: '2026-02-10',
    chargingStation: 'Fast Charger Downtown',
    energyUsed: '45 kWh',
    durationCharge: '$8.50',
    energyCharge: '$9.00',
    platformFee: '$0.75',
    taxAmount: '$1.45',
    totalAmount: '$19.70',
    status: 'completed',
    paymentMethod: 'Credit Card ****1234',
  },
  {
    id: '3',
    date: '2026-02-08',
    chargingStation: 'Community Charging Hub',
    energyUsed: '15 kWh',
    durationCharge: '$2.50',
    energyCharge: '$3.00',
    platformFee: '$0.25',
    taxAmount: '$0.50',
    totalAmount: '$6.25',
    status: 'completed',
    paymentMethod: 'PayPal',
  },
  {
    id: '4',
    date: '2026-02-05',
    chargingStation: 'Premium Fast Charge',
    energyUsed: '50 kWh',
    durationCharge: '$9.50',
    energyCharge: '$10.00',
    platformFee: '$0.95',
    taxAmount: '$1.65',
    totalAmount: '$22.10',
    status: 'completed',
    paymentMethod: 'Credit Card ****5678',
  },
]

function getStatusColor(status: string): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'success'
  }
}

interface PaymentHistoryProps {
  onNavigate: (page: string) => void
}

export default function PaymentHistory({ onNavigate }: PaymentHistoryProps) {
  const totalSpent = mockPayments.reduce((sum, p) => sum + parseFloat(p.totalAmount.replace('$', '')), 0)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Browse Listings', onClick: () => onNavigate('browse') },
          { label: 'Payment History', isActive: true },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold', color: colors.secondary }}>
        Payment History
      </Typography>

      {/* Summary Card */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#e8f5e9', borderTop: `4px solid ${colors.primary}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ color: colors.darkGray, mb: 1 }}>
              Total Spent
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.primary }}>
              ${totalSpent.toFixed(2)}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: colors.darkGray, mb: 1 }}>
              Total Sessions
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.primary }}>
              {mockPayments.length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Payments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Station</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}align="right">Energy Used</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Breakdown</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Payment Method</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.date}</TableCell>
                <TableCell>{payment.chargingStation}</TableCell>
                <TableCell align="right">{payment.energyUsed}</TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ display: 'block', color: colors.darkGray }}>
                    Duration: {payment.durationCharge} | Energy: {payment.energyCharge}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: colors.darkGray }}>
                    Fee: {payment.platformFee} | Tax: {payment.taxAmount}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.primary }}>
                  {payment.totalAmount}
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    color={getStatusColor(payment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{payment.paymentMethod}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  )
}
