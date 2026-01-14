import { debug, error } from '../utils/logger'
import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../stores/authStore'
import { 
  Package, 
  Truck, 
  Thermometer, 
  MapPin,
  TrendingUp,
  AlertCircle,
  User,
  Shield,
  Clock,
  Calendar
} from 'lucide-react'

interface DashboardStats {
  totalProducts: number
  totalShipments: number
  refrigeratedProducts: number
  pacificShipments: number
  lowStockItems: number
  pendingShipments: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalShipments: 0,
    refrigeratedProducts: 0,
    pacificShipments: 0,
    lowStockItems: 0,
    pendingShipments: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  
  const { user, session } = useAuthStore()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    if (!supabase) {
      // Supabase no está configurado; evitar llamadas remotas
      setLoading(false)
      return
    }

    try {
      // Obtener estadísticas
      const [
        { data: products },
        { data: shipments },
        { data: refrigerated },
        { data: pacificShipments },
        { data: lowStock },
        { data: pending }
      ] = await Promise.all([
        supabase.from('regional_inventory').select('*'),
        supabase.from('shipments').select('*'),
        supabase.from('products').select('*').eq('requires_refrigeration', true),
        supabase.from('shipments').select('*').eq('destination_zone_id', 'zona-pacifico'),
        supabase.from('regional_inventory').select('*').lt('quantity', 10),
        supabase.from('shipments').select('*').eq('status', 'pending')
      ])

      // Obtener despachos recientes
      const { data: recent } = await supabase
        .from('shipments')
        .select(`
          *,
          branches(name),
          special_zones(zone_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalProducts: products?.length || 0,
        totalShipments: shipments?.length || 0,
        refrigeratedProducts: refrigerated?.length || 0,
        pacificShipments: pacificShipments?.length || 0,
        lowStockItems: lowStock?.length || 0,
        pendingShipments: pending?.length || 0
      })

      setRecentShipments(recent || [])
      setLowStockProducts(lowStock || [])
    } catch (error) {
      error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Despachos Totales',
      value: stats.totalShipments,
      icon: Truck,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Productos Refrigerados',
      value: stats.refrigeratedProducts,
      icon: Thermometer,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Despachos al Pacífico',
      value: stats.pacificShipments,
      icon: MapPin,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Stock Bajo',
      value: stats.lowStockItems,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Despachos Pendientes',
      value: stats.pendingShipments,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    }
  ]

  // Calcular tiempo restante de sesión
  const getSessionTimeLeft = () => {
    if (!session?.expires_at) return 'Desconocido'
    
    const expiresAt = new Date(session.expires_at * 1000)
    const now = new Date()
    const diffMs = expiresAt.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 0) return 'Expirada'
    if (diffMins < 60) return `${diffMins} min`
    
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours} h`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome header with user info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              👋 ¡Hola, {user?.email?.split('@')[0] || 'Usuario'}!
            </h1>
            <p className="text-gray-600 mt-1">
              Bienvenido al sistema de gestión logística
            </p>
          </div>
          
          {/* Session info */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-2" />
              <span>JWT: {session?.access_token?.substring(0, 15)}...</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>Sesión: {getSessionTimeLeft()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despachos Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Despachos Recientes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentShipments.map((shipment) => (
                <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{shipment.shipment_code}</p>
                    <p className="text-sm text-gray-600">
                      {shipment.branches?.name} → {shipment.special_zones?.zone_name}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {shipment.status === 'delivered' ? 'Entregado' :
                     shipment.status === 'in_transit' ? 'En tránsito' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Productos con Stock Bajo */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Stock Bajo (≤ 10 unidades)</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{product.product_name}</p>
                    <p className="text-sm text-gray-600">Código: {product.product_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-bold">Stock: {product.quantity}</p>
                    <p className="text-xs text-gray-500">Mínimo: 10</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-center text-gray-500 py-4">Todos los productos tienen stock suficiente</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug panel (solo desarrollo) */}
      {import.meta.env.DEV && (
        <div className="bg-gray-800 text-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">🔍 Información de Debug (JWT)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Usuario ID:</p>
              <code className="text-green-300 break-all">{user?.id}</code>
            </div>
            <div>
              <p className="text-gray-400">Email:</p>
              <code className="text-green-300">{user?.email}</code>
            </div>
            <div>
              <p className="text-gray-400">Expira:</p>
              <code className="text-green-300">
                {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}
              </code>
            </div>
            <div>
              <p className="text-gray-400">Token (primeros 30 chars):</p>
              <code className="text-green-300 break-all">
                {session?.access_token?.substring(0, 30)}...
              </code>
            </div>
          </div>
          <button
            onClick={() => {
              debug('🗝️ JWT completo:', session?.access_token)
              debug('👤 Usuario completo:', user)
              debug('📋 Sesión completa:', session)
            }}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Mostrar en consola
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard