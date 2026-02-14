import { useState } from 'react'
import { Box } from '@mui/material'
import { lazy, Suspense } from 'react'
import TenantSidebar, { DRAWER_WIDTH } from '../components/TenantSidebar'
import BrowseListings from './Tenant/BrowseListings'

const MyReservations = lazy(() => import('./Tenant/MyReservations'))
const ActiveSessions = lazy(() => import('./Tenant/ActiveSessions'))
const PaymentHistory = lazy(() => import('./Tenant/PaymentHistory'))

export default function TenantScreen() {
  const [currentPage, setCurrentPage] = useState('browse')

  const renderContent = () => {
    switch (currentPage) {
      case 'browse':
        return <BrowseListings onNavigate={setCurrentPage} />
      case 'reservations':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <MyReservations onNavigate={setCurrentPage} />
          </Suspense>
        )
      case 'sessions':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <ActiveSessions onNavigate={setCurrentPage} />
          </Suspense>
        )
      case 'payments':
        return (
          <Suspense fallback={<div>Loading...</div>}>
            <PaymentHistory onNavigate={setCurrentPage} />
          </Suspense>
        )
      default:
        return <BrowseListings onNavigate={setCurrentPage} />
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TenantSidebar activeTab={currentPage} onTabChange={setCurrentPage} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  )
}
