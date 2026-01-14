// src/components/Sidebar.tsx - VERSIÓN COMPATIBLE CON DashboardLayout
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Users, 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Mail,
  LogOut,
  X,
  Home,
  FileText,
  Calendar,
  CreditCard,
  Shield,
  Box,
  Warehouse,
  ClipboardCheck,
  CheckCircle
} from 'lucide-react'

interface SidebarProps {
  mobileOpen?: boolean
  onMobileToggle?: () => void
  onMobileClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen = false, 
  onMobileToggle,
  onMobileClose 
}) => {
  const [inventoryOpen, setInventoryOpen] = useState(true)

  const menuItems = [
    { 
      path: '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '#inventario', 
      icon: <Package className="h-5 w-5" />, 
      label: 'Inventario',
      children: [
        { path: '/inventario', label: 'Visión General', icon: <Box className="h-4 w-4" /> },
        { path: '/inventario/productos', label: 'Productos', icon: <Package className="h-4 w-4" /> },
        { path: '/inventario/categorias', label: 'Categorías', icon: <FileText className="h-4 w-4" /> },
        { path: '/inventario/almacenes', label: 'Almacenes', icon: <Warehouse className="h-4 w-4" /> },
        { path: '/inventario/movimientos', label: 'Movimientos', icon: <CreditCard className="h-4 w-4" /> },
        { path: '/inventario/alertas', label: 'Alertas Stock', icon: <Bell className="h-4 w-4" /> },
      ]
    },
    { 
      path: '/despachos', 
      icon: <Truck className="h-5 w-5" />, 
      label: 'Despachos',
      children: [
        { path: '/despachos', label: 'Todos los Despachos', icon: <Truck className="h-4 w-4" /> },
        { path: '/despachos/pendientes', label: 'Pendientes', icon: <ClipboardCheck className="h-4 w-4" /> },
        { path: '/despachos/completados', label: 'Completados', icon: <CheckCircle className="h-4 w-4" /> },
      ]
    },
    { 
      path: '/clientes', 
      icon: <Users className="h-5 w-5" />, 
      label: 'Clientes' 
    },
    { 
      path: '/reportes', 
      icon: <BarChart3 className="h-5 w-5" />, 
      label: 'Reportes' 
    },
    { 
      path: '/calendario', 
      icon: <Calendar className="h-5 w-5" />, 
      label: 'Calendario' 
    },
  ]

  const systemItems = [
    { path: '/configuracion', icon: <Settings className="h-5 w-5" />, label: 'Configuración' },
    { path: '/notificaciones', icon: <Bell className="h-5 w-5" />, label: 'Notificaciones' },
    { path: '/ayuda', icon: <HelpCircle className="h-5 w-5" />, label: 'Ayuda' },
  ]

  return (
    <>
      {/* Mobile close button */}
      {mobileOpen && (
        <button
          onClick={onMobileClose}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-md shadow-lg"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-gray-900 to-gray-950 text-white h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-lg">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                Logística
              </h1>
              <p className="text-xs text-gray-400">Inteligente</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/40 backdrop-blur-sm">
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">Sistema de Logística</p>
              <p className="text-xs text-gray-400 truncate">
                prueba@correo.com
              </p>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
            Navegación Principal
          </p>
          
          {menuItems.map((item) => (
            <div key={item.path} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => setInventoryOpen(!inventoryOpen)}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-800/50 transition-all text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400 group-hover:text-blue-400 transition-colors">
                        {item.icon}
                      </div>
                      <span className="font-medium group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${inventoryOpen ? 'rotate-180' : ''} text-gray-500`} />
                  </button>
                  
                  {inventoryOpen && (
                    <div className="ml-10 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onMobileClose}
                          className={({ isActive }) =>
                            `flex items-center space-x-2 p-2 rounded text-sm transition-colors ${
                              isActive 
                                ? 'bg-blue-900/30 text-blue-300 border-l-2 border-blue-500' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                            }`
                          }
                        >
                          <span className="text-gray-500">{child.icon}</span>
                          <span>{child.label}</span>
                        </NavLink>
                      ))}
                      {/* Enlace especial de correo - Según tu imagen */}
                      <a
                        href="mailto:Despachos@reo.com"
                        className="flex items-center space-x-2 p-2 rounded text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                        onClick={onMobileClose}
                      >
                        <Mail className="h-4 w-4" />
                        <span>Despachos@reo.com</span>
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-all group ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600/20 to-blue-500/10 text-white border-l-2 border-blue-500' 
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white hover:border-l-2 hover:border-gray-700'
                    }`
                  }
                  end={item.exact}
                >
                  <div className={`${item.path === '/dashboard' ? 'text-blue-400' : 'text-gray-400'} group-hover:text-blue-400 transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}

          {/* Separator */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              Sistema
            </p>
            
            {systemItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-800 text-white' 
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-4 border-t border-gray-800 space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800/40 p-2 rounded-lg text-center backdrop-blur-sm">
              <p className="text-lg font-bold">24</p>
              <p className="text-xs text-gray-400">Activos</p>
            </div>
            <div className="bg-gray-800/40 p-2 rounded-lg text-center backdrop-blur-sm">
              <p className="text-lg font-bold">8</p>
              <p className="text-xs text-gray-400">Pend.</p>
            </div>
            <div className="bg-gray-800/40 p-2 rounded-lg text-center backdrop-blur-sm">
              <p className="text-lg font-bold">3</p>
              <p className="text-xs text-gray-400">Alertas</p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              // Aquí iría tu lógica de logout
              console.log('Logout clicked')
            }}
            className="flex items-center justify-center space-x-2 w-full p-3 rounded-lg bg-gradient-to-r from-red-900/30 to-red-800/20 text-red-300 hover:from-red-800/40 hover:to-red-700/30 hover:text-red-200 transition-all border border-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>

          {/* Version */}
          <div className="text-center">
            <p className="text-xs text-gray-500">v2.1.0 • Logística Inteligente</p>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  )
}

export default Sidebar