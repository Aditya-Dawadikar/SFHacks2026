import { Box, Container, Typography, Card, CardContent, Grid, Paper } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SettingsIcon from '@mui/icons-material/Settings'

interface OwnerDashboardProps {
  onNavigate: (page: string) => void
}

export default function OwnerDashboard({ onNavigate }: OwnerDashboardProps) {
  const stats = [
    { label: 'Active Listings', value: 5, icon: BuildIcon, color: '#13AA52' },
    { label: 'Pending Reservations', value: 8, icon: AssignmentIcon, color: '#ff9800' },
    { label: 'Total Earnings', value: '$2,450', icon: AttachMoneyIcon, color: '#4caf50' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Dashboard
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  backgroundColor: '#fff',
                  border: `2px solid ${stat.color}`,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: `${stat.color}20`,
                    padding: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComponent sx={{ fontSize: 32, color: stat.color }} />
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )
        })}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 4, mb: 2 }}>
        Quick Actions
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
              backgroundColor: '#f5f5f5',
            }}
            onClick={() => onNavigate('listings')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <BuildIcon sx={{ fontSize: 40, color: '#13AA52', mb: 1 }} />
                <Typography variant="subtitle2">Manage Listings</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
              backgroundColor: '#f5f5f5',
            }}
            onClick={() => onNavigate('reservations')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
                <Typography variant="subtitle2">View Reservations</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
              backgroundColor: '#f5f5f5',
            }}
            onClick={() => onNavigate('earnings')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <AttachMoneyIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
                <Typography variant="subtitle2">Earnings</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 4 },
              backgroundColor: '#f5f5f5',
            }}
            onClick={() => onNavigate('settings')}
          >
            <CardContent>
              <Box sx={{ textAlign: 'center' }}>
                <SettingsIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
                <Typography variant="subtitle2">Settings</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
