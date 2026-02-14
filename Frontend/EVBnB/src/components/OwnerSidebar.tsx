import { useNavigate } from 'react-router-dom'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HistoryIcon from '@mui/icons-material/History'
import LogoutIcon from '@mui/icons-material/Logout'
import BuildIcon from '@mui/icons-material/Build'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import SettingsIcon from '@mui/icons-material/Settings'
import { colors } from '../theme/colors'

interface OwnerSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const DRAWER_WIDTH = 280

export default function OwnerSidebar({ activeTab, onTabChange }: OwnerSidebarProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'listings', label: 'Manage Listings', icon: BuildIcon },
    { id: 'reservations', label: 'View Reservations', icon: AssignmentIcon },
    { id: 'earnings', label: 'Earnings', icon: AttachMoneyIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
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
