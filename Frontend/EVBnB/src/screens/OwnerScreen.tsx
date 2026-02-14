import { useState } from 'react'
import { Box } from '@mui/material'
import OwnerSidebar, { DRAWER_WIDTH } from '../components/OwnerSidebar'
import OwnerDashboard from './Owner/OwnerDashboard'
import OwnerHistory from './Owner/OwnerHistory'
import ManageListings from './Owner/ManageListings'
import ViewReservations from './Owner/ViewReservations'
import EarningsPage from './Owner/EarningsPage'
import SettingsPage from './Owner/SettingsPage'

export default function OwnerScreen() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <OwnerDashboard onNavigate={setCurrentPage} />
      case 'history':
        return <OwnerHistory onNavigate={setCurrentPage} />
      case 'listings':
        return <ManageListings onNavigate={setCurrentPage} />
      case 'reservations':
        return <ViewReservations onNavigate={setCurrentPage} />
      case 'earnings':
        return <EarningsPage onNavigate={setCurrentPage} />
      case 'settings':
        return <SettingsPage onNavigate={setCurrentPage} />
      default:
        return <OwnerDashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <OwnerSidebar activeTab={currentPage} onTabChange={setCurrentPage} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${DRAWER_WIDTH}px`,
          backgroundColor: '#fafafa',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  )
}
