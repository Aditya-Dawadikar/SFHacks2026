import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import BreadcrumbNav from '../../components/BreadcrumbNav'

interface SettingsPageProps {
  onNavigate: (page: string) => void
}

export default function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <BreadcrumbNav
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Settings', isActive: true },
        ]}
      />

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Settings
      </Typography>

      {/* Account Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Account Settings
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Business Name"
            defaultValue="John's EV Charging Co."
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Email"
            defaultValue="john@evcharging.com"
            fullWidth
            variant="outlined"
            disabled
          />
          <TextField
            label="Phone Number"
            defaultValue="+1 (555) 123-4567"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Bank Account (Last 4 digits)"
            defaultValue="••••••••5432"
            fullWidth
            variant="outlined"
            disabled
          />

          <Button variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start', mt: 1 }}>
            Save Changes
          </Button>
        </Box>
      </Paper>

      {/* Notification Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Notification Preferences
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Email notifications for new reservations"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="SMS alerts for cancellations"
          />
          <FormControlLabel
            control={<Switch />}
            label="Weekly earnings reports"
          />
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Marketing and promotional emails"
          />
        </Box>
      </Paper>

      {/* Security Settings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Security
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            variant="outlined"
          />

          <Button variant="contained" color="warning" sx={{ alignSelf: 'flex-start', mt: 1 }}>
            Change Password
          </Button>
        </Box>
      </Paper>

      {/* Danger Zone */}
      <Card sx={{ p: 3, backgroundColor: '#ffebee', border: '1px solid #ef5350' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f', mb: 2 }}>
            Danger Zone
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            These actions cannot be undone. Please proceed with caution.
          </Typography>
          <Button variant="outlined" color="error">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </Container>
  )
}
