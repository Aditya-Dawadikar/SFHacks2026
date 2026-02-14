import { Container, Typography, Paper, Box, Grid, Card, CardContent, Button } from '@mui/material'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DownloadIcon from '@mui/icons-material/Download'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface EarningsProps {
  onNavigate: (page: string) => void
}

export default function EarningsPage({ onNavigate }: EarningsProps) {
  const earningsData = {
    monthlyEarnings: '$2,450.00',
    totalEarnings: '$12,890.00',
    pendingPayouts: '$450.00',
    lastPayout: '2026-02-01',
  }

  const earningsBreakdown = [
    { month: 'January', amount: '$1,890.00', sessions: 42 },
    { month: 'February', amount: '$2,450.00', sessions: 56 },
    { month: 'December', amount: '$2,150.00', sessions: 48 },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Earnings', isActive: true },
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Earnings
        </Typography>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Download Report
        </Button>
      </Box>

      {/* Earnings Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#e8f5e9', borderLeft: '4px solid #13AA52' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: '#13AA52' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Monthly Earnings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {earningsData.monthlyEarnings}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#f3e5f5', borderLeft: '4px solid #9c27b0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Total Earnings
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {earningsData.totalEarnings}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: '#ff9800' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Pending Payouts
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {earningsData.pendingPayouts}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, backgroundColor: '#e8f5e9', borderLeft: '4px solid #4caf50' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Last Payout
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {earningsData.lastPayout}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Earnings Breakdown */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Monthly Breakdown
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {earningsBreakdown.map((item, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {item.month}
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold', mb: 0.5 }}>
                  {item.amount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {item.sessions} charging sessions
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
    </Container>
  )
}
