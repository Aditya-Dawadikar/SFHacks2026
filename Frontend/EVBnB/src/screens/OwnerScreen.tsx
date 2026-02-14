import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Card, CardContent, Button, AppBar, Toolbar } from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import LogoutIcon from '@mui/icons-material/Logout'

export default function OwnerScreen() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setEmail(userData.email)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            EVBnB - Owner Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {email}
          </Typography>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h2" gutterBottom>
            Owner Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Manage your EV charging spots and reservations
          </Typography>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Manage Listings</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Add and manage your EV charging spot listings
                  </Typography>
                </Box>
              </Box>
              <Button variant="contained" sx={{ mt: 2 }}>
                Go to Listings
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  )
}
