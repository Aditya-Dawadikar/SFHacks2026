import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import ElectricCarIcon from '@mui/icons-material/ElectricCar'
import PaymentIcon from '@mui/icons-material/Payment'
import LogoutIcon from '@mui/icons-material/Logout'
import { colors } from '../theme/colors'

interface TenantSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const DRAWER_WIDTH = 280

export default function TenantSidebar({ activeTab, onTabChange }: TenantSidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'browse', label: 'Browse Listings', icon: SearchIcon },
    { id: 'reservations', label: 'My Reservations', icon: BookmarkIcon },
    { id: 'sessions', label: 'Active Sessions', icon: ElectricCarIcon },
    { id: 'payments', label: 'Payment History', icon: PaymentIcon },
  ]

  return (
    <Drawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: colors.secondary,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: colors.primary,
        }}
      >
        EVBnB
      </Toolbar>
      <Divider sx={{ backgroundColor: colors.secondaryLight }} />

      <List>
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          return (
            <ListItem
              button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              sx={{
                backgroundColor: activeTab === tab.id ? '#2a2a2a' : 'transparent',
                borderLeft: activeTab === tab.id ? `4px solid ${colors.primary}` : 'none',
                '&:hover': {
                  backgroundColor: activeTab === tab.id ? '#2a2a2a' : '#252525',
                },
              }}
            >
              <ListItemIcon sx={{ color: activeTab === tab.id ? colors.primary : colors.darkGray }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText
                primary={tab.label}
                sx={{
                  color: activeTab === tab.id ? colors.primary : colors.darkGray,
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ mt: 'auto', backgroundColor: colors.secondaryLight }} />

      <List>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            '&:hover': {
              backgroundColor: '#2a2a2a',
            },
          }}
        >
          <ListItemIcon sx={{ color: colors.error }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            sx={{
              color: colors.error,
            }}
          />
        </ListItem>
      </List>
    </Drawer>
  )
}

export { DRAWER_WIDTH }
