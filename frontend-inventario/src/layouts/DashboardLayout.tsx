// src/layouts/DashboardLayout.tsx - VERSIÓN MEJORADA
import { useState } from 'react'
import type { FC, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const DashboardLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header - Mobile only, very compact */}
        <header className="lg:hidden bg-white/80 backdrop-blur-sm shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xs font-semibold text-gray-800">Logística</h1>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
              P
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-2">
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