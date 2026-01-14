// components/Login.tsx - Solo las partes importantes modificadas
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LogIn, Mail, Lock, AlertCircle, Database, Server } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [debugInfo, setDebugInfo] = useState<any>({})
  
  const { 
    login, 
    loading, 
    error, 
    user, 
    clearError,
    initializeAuth
  } = useAuthStore()
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // Configuración inicial
  useEffect(() => {
    const init = async () => {
      debug('🚀 Inicializando login...')
      
      // Verificar variables de entorno
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      debug('🔧 Configuración Supabase:')
      debug('- URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
      debug('- Key:', supabaseKey ? '✅ Configurada' : '❌ Faltante')
      
      // Inicializar autenticación
      await initializeAuth()
      
      // Recolectar info
      setDebugInfo({
        supabase: {
          url: supabaseUrl ? '✅' : '❌',
          key: supabaseKey ? '✅' : '❌'
        },
        userInStore: user ? `✅ ${user.email}` : '❌ No autenticado'
      })
      
      clearError()
    }
    
    init()
  }, [initializeAuth, clearError])
  
  // Efecto para redirección
  useEffect(() => {
    if (user) {
      debug('🔄 Usuario autenticado, redirigiendo...')
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state])
  
  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    clearError()
    
    // Validaciones
    if (!email || !password) {
      setFormError('Por favor ingresa email y contraseña')
      return
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Por favor ingresa un email válido')
      return
    }
    
    try {
      debug('📤 Intentando autenticar...')
      await login(email, password)
      // La redirección se maneja en el efecto de arriba
      
    } catch (err: any) {
      error('❌ Error de autenticación:', err.message)
      // El error ya está manejado en el store
    }
  }
  
  // Manejar credenciales de prueba
  const handleTestCredentials = () => {
    // Cambia esto por credenciales REALES de tu Supabase
    setEmail('prueba@correo.com') // Del sidebar
    setPassword('') // Debes poner una contraseña real
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center space-x-4">
          <Database className="h-10 w-10 text-blue-600" />
          <Server className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema de Logística Inteligente
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Autenticación con Supabase + Django
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Campos del formulario (igual que antes) */}
            {/* ... */}
            
            {/* Botón de submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Conectando con Supabase...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {/* Panel de configuración */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">⚙️ Configuración Requerida</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>1. Variables de entorno en <code>.env.local</code>:</p>
              <pre className="bg-gray-800 text-gray-100 p-2 rounded text-xs mt-1">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica`}
              </pre>
              
              <p className="mt-2">2. Usuarios en Supabase:</p>
              <ul className="list-disc pl-4 mt-1">
                <li>Crear usuario en Authentication → Users</li>
                <li>Configurar credenciales correctas</li>
                <li>Verificar email si es necesario</li>
              </ul>
            </div>
          </div>

          {/* Botones de ayuda */}
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleTestCredentials}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Usar email de prueba
            </button>
            
            <button
              type="button"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              className="w-full inline-flex justify-center items-center py-2 px-4 border border-purple-300 rounded-md shadow-sm bg-purple-50 text-sm font-medium text-purple-700 hover:bg-purple-100"
            >
              <Database className="h-4 w-4 mr-2" />
              Ir a Dashboard Supabase
            </button>
          </div>
        </div>

        {/* Info de debug */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">🔍 Estado del Sistema:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${debugInfo.supabase?.url === '✅' ? 'bg-green-100' : 'bg-red-100'}`}>
                Supabase URL: {debugInfo.supabase?.url || '❌'}
              </div>
              <div className={`p-2 rounded ${debugInfo.supabase?.key === '✅' ? 'bg-green-100' : 'bg-red-100'}`}>
                Supabase Key: {debugInfo.supabase?.key || '❌'}
              </div>
              <div className={`p-2 rounded ${user ? 'bg-green-100' : 'bg-yellow-100'}`}>
                Autenticación: {user ? '✅ Activa' : '❌ Inactiva'}
              </div>
              <div className="p-2 rounded bg-blue-100">
                Backend: Django (localhost:8000)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login