// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardLayout from './layouts/DashboardLayout'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with DashboardLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Inventario routes */}
          <Route path="inventario">
            <Route index element={<div className="p-6">Visión General del Inventario</div>} />
            <Route path="productos" element={<div className="p-6">Gestión de Productos</div>} />
            <Route path="categorias" element={<div className="p-6">Categorías de Productos</div>} />
            <Route path="almacenes" element={<div className="p-6">Gestión de Almacenes</div>} />
            <Route path="movimientos" element={<div className="p-6">Movimientos de Inventario</div>} />
            <Route path="alertas" element={<div className="p-6">Alertas de Stock</div>} />
          </Route>
          
          {/* Despachos routes */}
          <Route path="despachos">
            <Route index element={<div className="p-6">Todos los Despachos</div>} />
            <Route path="pendientes" element={<div className="p-6">Despachos Pendientes</div>} />
            <Route path="completados" element={<div className="p-6">Despachos Completados</div>} />
          </Route>
          
          <Route path="clientes" element={<div className="p-6">Gestión de Clientes</div>} />
          <Route path="reportes" element={<div className="p-6">Reportes y Análisis</div>} />
          <Route path="calendario" element={<div className="p-6">Calendario de Actividades</div>} />
          
          {/* Sistema routes */}
          <Route path="configuracion" element={<div className="p-6">Configuración del Sistema</div>} />
          <Route path="notificaciones" element={<div className="p-6">Centro de Notificaciones</div>} />
          <Route path="ayuda" element={<div className="p-6">Centro de Ayuda</div>} />
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App