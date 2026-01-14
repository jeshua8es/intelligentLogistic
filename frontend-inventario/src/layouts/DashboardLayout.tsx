// src/layouts/DashboardLayout.tsx
import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const DashboardLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600/75 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        mobileOpen={sidebarOpen}
        onMobileToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main content - flex-1 para ocupar todo el espacio restante */}
      <div className="flex-1 flex flex-col">
        {/* Top header - Simplified */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Sistema de Logística Inteligente
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Gestión integral de inventario y despachos
                </p>
              </div>
            </div>

            {/* User info in header */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block text-right">
                <p className="text-sm font-medium text-gray-900">prueba@correo.com</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                  P
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Render children OR outlet */}
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white mt-8">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} Sistema de Logística Inteligente. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-2 sm:mt-0">
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Soporte</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacidad</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Términos</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default DashboardLayout