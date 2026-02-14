import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginScreen from './screens/LoginScreen'

const OwnerScreen = lazy(() => import('./screens/OwnerScreen'))
const TenantScreen = lazy(() => import('./screens/TenantScreen'))

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredUserType: 'owner' | 'tenant'
}

function ProtectedRoute({ children, requiredUserType }: ProtectedRouteProps) {
  const user = localStorage.getItem('user')
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  const userData = JSON.parse(user)
  
  if (userData.userType !== requiredUserType) {
    return <Navigate to={`/${userData.userType}`} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        
        <Route 
          path="/owner" 
          element={
            <ProtectedRoute requiredUserType="owner">
              <Suspense fallback={<div>Loading...</div>}>
                <OwnerScreen />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenant" 
          element={
            <ProtectedRoute requiredUserType="tenant">
              <Suspense fallback={<div>Loading...</div>}>
                <TenantScreen />
              </Suspense>
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
