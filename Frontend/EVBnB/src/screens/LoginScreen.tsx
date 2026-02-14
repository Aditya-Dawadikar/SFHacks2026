import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'

export default function LoginScreen() {
  const navigate = useNavigate()
  const [userType, setUserType] = useState<'owner' | 'tenant'>('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      return
    }

    // Simulate login and redirect
    console.log('Login attempt:', { userType, email, password })
    
    // Store user info in localStorage (basic auth simulation)
    localStorage.setItem('user', JSON.stringify({ userType, email }))
    
    // Redirect to respective dashboard
    navigate(`/${userType}`)
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <BatteryChargingFullIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                EVBnB
              </Typography>
            </Box>

            <Typography variant="body1" color="textSecondary" sx={{ textAlign: 'center', mb: 3 }}>
              EV Charging Spot Sharing Platform
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin}>
              {/* User Type Selection */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>I am a...</InputLabel>
                <Select
                  value={userType}
                  label="I am a..."
                  onChange={(e) => setUserType(e.target.value as 'owner' | 'tenant')}
                >
                  <MenuItem value="owner">Charging Spot Owner</MenuItem>
                  <MenuItem value="tenant">Tenant (Looking for Spots)</MenuItem>
                </Select>
              </FormControl>

              {/* Email Field */}
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="your@email.com"
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="••••••••"
              />

              {/* Login Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>

              {/* Sign Up Link */}
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'textSecondary' }}>
                Don't have an account?{' '}
                <Typography
                  component="span"
                  sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Sign up
                </Typography>
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
