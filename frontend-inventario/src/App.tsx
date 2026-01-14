import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { supabase } from './services/supabase'

import './index.css';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Shipments from './pages/Shipments'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { loading, setLoading } = useAuthStore()

  useEffect(() => {
    // Verificar sesión al iniciar
    if (!supabase) {
      useAuthStore.getState().setSession(null)
      useAuthStore.getState().setUser(null)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setSession(session)
      useAuthStore.getState().setUser(session?.user ?? null)
      setLoading(false)
    })
  }, [setLoading])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/shipments" element={<Shipments />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
