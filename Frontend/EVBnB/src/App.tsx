import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

const OwnerScreen = lazy(() => import('./screens/OwnerScreen'))
const TenantScreen = lazy(() => import('./screens/TenantScreen'))

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/owner" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <OwnerScreen />
            </Suspense>
          } 
        />
        
        <Route 
          path="/tenant" 
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <TenantScreen />
            </Suspense>
          } 
        />
        
        <Route path="/" element={<Navigate to="/owner" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
