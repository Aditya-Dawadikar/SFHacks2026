import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, Typography, Card, CardContent, Button, AppBar, Toolbar } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import LogoutIcon from '@mui/icons-material/Logout'

export default function TenantScreen() {
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
            EVBnB - Tenant Dashboard
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
            Tenant Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Find and reserve EV charging spots
          </Typography>

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SearchIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">Find Charging Spots</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Search and reserve available EV charging stations
                  </Typography>
                </Box>
              </Box>
              <Button variant="contained" sx={{ mt: 2 }}>
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  )
}
