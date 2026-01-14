// src/pages/Dashboard.tsx - VERSIÓN CORREGIDA
import React from 'react'
import { 
  Package, 
  Truck, 
  BarChart3, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  DollarSign, 
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw
} from 'lucide-react'

const Dashboard: React.FC = () => {
  const stats = [
    { 
      title: 'Inventario Total', 
      value: '1,248', 
      change: '+12.5%', 
      trend: 'up',
      icon: <Package className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    { 
      title: 'Pedidos Hoy', 
      value: '56', 
      change: '+8.2%', 
      trend: 'up',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    { 
      title: 'En Despacho', 
      value: '23', 
      change: '-3.1%', 
      trend: 'down',
      icon: <Truck className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    { 
      title: 'Ingresos Mensual', 
      value: '$24,580', 
      change: '+18.7%', 
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-purple-500'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'Pedido completado', user: 'Juan Pérez', time: 'Hace 5 min', status: 'success' },
    { id: 2, action: 'Nueva orden recibida', user: 'María García', time: 'Hace 12 min', status: 'info' },
    { id: 3, action: 'Producto agotado', user: 'Carlos López', time: 'Hace 25 min', status: 'warning' },
    { id: 4, action: 'Despacho programado', user: 'Ana Martínez', time: 'Hace 1 hora', status: 'info' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Logística</h1>
          <p className="text-gray-600">Bienvenido al sistema de gestión inteligente</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Actualizado: {new Date().toLocaleTimeString()}
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className={`flex items-center ml-3 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">vs mes anterior</p>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-sm`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Actividad Reciente</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Ver todo →
              </button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`p-3 rounded-full mr-4 ${
                    activity.status === 'success' ? 'bg-green-100 text-green-600' :
                    activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.status === 'success' ? 
                      <CheckCircle className="h-5 w-5" /> :
                      <AlertTriangle className="h-5 w-5" />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">por {activity.user}</p>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="h-6 w-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Nuevo Producto</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ShoppingCart className="h-6 w-6 text-green-600 mb-2" />
                <span className="text-sm font-medium">Crear Orden</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Truck className="h-6 w-6 text-orange-600 mb-2" />
                <span className="text-sm font-medium">Despachar</span>
              </button>
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Reporte</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* User Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center mb-4">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Sistema de Logística</h3>
                <p className="text-sm opacity-90">Inteligente</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Gestión completa de inventario y despachos en tiempo real.
            </p>
            <div className="text-sm">
              <p className="opacity-90">prueba@correo.com</p>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-xs">Sistema activo</span>
              </div>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Inventario</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Disponible</span>
                  <span className="font-medium text-gray-900">85%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">En uso</span>
                  <span className="font-medium text-gray-900">12%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '12%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Bajo stock</span>
                  <span className="font-medium text-gray-900">3%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '3%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alertas del Sistema</h2>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-sm text-gray-900">3 productos con stock bajo</p>
                  <p className="text-xs text-gray-600">Revisar inventario</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-sm text-gray-900">2 despachos pendientes</p>
                  <p className="text-xs text-gray-600">Programar para hoy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard