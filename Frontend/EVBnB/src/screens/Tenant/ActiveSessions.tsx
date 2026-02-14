import { Container, Typography, Paper, Box, Card, CardContent, Grid, LinearProgress, Chip } from '@mui/material'
import BoltIcon from '@mui/icons-material/Bolt'
import TimerIcon from '@mui/icons-material/Timer'
import BrowseryIcon from '@mui/icons-material/ElectricCar'
import BreadcrumbNav from '../../components/BreadcrumbNav'
import { colors } from '../../theme/colors'

interface ActiveSession {
  id: string
  chargingStation: string
  location: string
  startTime: string
  estimatedEndTime: string
  chargerType: string
  energyChargedKwh: number
  totalEnergyNeeded: number
  costSoFar: string
  estimatedTotalCost: string
}

const mockSessions: ActiveSession[] = [
  {
    id: '1',
    chargingStation: 'Fast Charger Downtown',
    location: 'Downtown, San Francisco',
    startTime: '2026-02-14 02:30 PM',
    estimatedEndTime: '2026-02-14 04:30 PM',
    chargerType: 'DC Fast Charger',
    energyChargedKwh: 35,
    totalEnergyNeeded: 60,
    costSoFar: '$8.75',
    estimatedTotalCost: '$15.00',
  },
]

interface ActiveSessionsProps {
  onNavigate: (page: string) => void
}

export default function ActiveSessions({ onNavigate }: ActiveSessionsProps) {
  const progressPercent = (mockSessions[0].energyChargedKwh / mockSessions[0].totalEnergyNeeded) * 100

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Browse Listings', onClick: () => onNavigate('browse') },
          { label: 'Active Sessions', isActive: true },
        ]}
      />

      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: colors.secondary }}>
        Active Charging Sessions
      </Typography>

      {mockSessions.length > 0 ? (
        mockSessions.map((session) => (
          <Card key={session.id} sx={{ mb: 4, borderTop: `4px solid ${colors.primary}` }}>
            <CardContent>
              <Grid container spacing={3}>
                {/* Station Info */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: colors.secondary }}>
                    {session.chargingStation}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: colors.darkGray }}>
                      Location: {session.location}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.darkGray }}>
                      Charger Type: <Chip label={session.chargerType} size="small" color="error" sx={{ ml: 1 }} />
                    </Typography>
                  </Box>
                </Grid>

                {/* Time Info */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimerIcon sx={{ mr: 1, color: colors.primary }} />
                    <Box>
                      <Typography variant="body2" sx={{ color: colors.darkGray }}>
                        Started: {session.startTime}
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.darkGray }}>
                        Estimated End: {session.estimatedEndTime}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Energy Progress */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BoltIcon sx={{ mr: 1, color: colors.primary }} />
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Energy Charged
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                        {session.energyChargedKwh} / {session.totalEnergyNeeded} kWh
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progressPercent}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: colors.primary,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Grid>

                {/* Cost Info */}
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                    <Typography variant="body2" sx={{ color: colors.darkGray, mb: 1 }}>
                      Cost So Far
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary }}>
                      {session.costSoFar}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, backgroundColor: '#e8f5e9' }}>
                    <Typography variant="body2" sx={{ color: colors.darkGray, mb: 1 }}>
                      Estimated Total
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.primary }}>
                      {session.estimatedTotalCost}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: colors.darkGray }}>
            No active charging sessions at the moment.
          </Typography>
        </Paper>
      )}
    </Container>
  )
}
