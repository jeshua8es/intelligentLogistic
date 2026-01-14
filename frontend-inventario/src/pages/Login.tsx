import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { LogIn, Mail, Lock, AlertCircle, Database, Server, RefreshCw, Trash2 } from 'lucide-react'

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
    initializeAuth,
    logout
  } = useAuthStore()
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // Función para actualizar debug info
  const updateDebugInfo = useCallback(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    const info = {
      supabase: {
        url: supabaseUrl ? '✅' : '❌',
        key: supabaseKey ? '✅' : '❌'
      },
      userInStore: user ? `✅ ${user.email}` : '❌ No autenticado',
      localStorage: {
        auth_user: localStorage.getItem('auth_user') ? '✅' : '❌',
        auth_token: localStorage.getItem('auth_token') ? '✅' : '❌'
      }
    }
    
    setDebugInfo(info)
  }, [user])
  
  // Configuración inicial - SOLO UNA VEZ
  useEffect(() => {
    console.log('🚀 Login montado - Inicializando...')
    
    // Limpiar errores
    clearError()
    
    // Inicializar auth
    initializeAuth()
    
    // Actualizar debug info inicial
    updateDebugInfo()
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // ← Array VACÍO para que solo se ejecute una vez
  
  // Efecto separado para redirección
  useEffect(() => {
    if (user) {
      console.log('✅ Usuario autenticado, redirigiendo...')
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location.state]) // ← Solo se ejecuta cuando user cambia
  
  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    clearError()
    
    // Validaciones básicas
    if (!email || !password) {
      setFormError('Por favor ingresa email y contraseña')
      return
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      setFormError('Por favor ingresa un email válido')
      return
    }
    
    try {
      console.log('📤 Intentando login...')
      await login(email, password)
      // La redirección se maneja en el efecto separado
    } catch (err: any) {
      console.error('❌ Error de autenticación:', err.message)
    }
  }
  
  // Manejar credenciales de prueba
  const handleTestCredentials = () => {
    setEmail('prueba@correo.com')
    setPassword('123456')
  }
  
  // Limpiar autenticación
  const handleClearAuth = async () => {
    await logout()
    setEmail('')
    setPassword('')
    updateDebugInfo()
    console.log('🧹 Autenticación limpiada')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center space-x-4">
          <Database className="h-10 w-10 text-blue-600" />
          <Server className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sistema de Logística Inteligente
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Autenticación segura con JWT
        </p>
      </div>

      {/* Formulario */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="usuario@ejemplo.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Errores */}
            {(error || formError) && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error || formError}
                    </h3>
                  </div>
                </div>
              </div>
            )}

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
                    Conectando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {/* Botones de desarrollo */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Para desarrollo
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleTestCredentials}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Usar credenciales de prueba
              </button>
              
              <button
                type="button"
                onClick={handleClearAuth}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-red-300 rounded-md shadow-sm bg-red-50 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar autenticación
              </button>
              
              <button
                type="button"
                onClick={updateDebugInfo}
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar info
              </button>
            </div>
          </div>
        </div>

        {/* Panel de debug */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium text-gray-700">🔍 Estado del Sistema</h4>
              <button
                onClick={() => console.log('Debug completo:', debugInfo)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Ver en consola
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2 rounded ${debugInfo.supabase?.url === '✅' ? 'bg-green-100' : 'bg-red-100'}`}>
                Supabase URL: {debugInfo.supabase?.url || '❌'}
              </div>
              <div className={`p-2 rounded ${debugInfo.supabase?.key === '✅' ? 'bg-green-100' : 'bg-red-100'}`}>
                Supabase Key: {debugInfo.supabase?.key || '❌'}
              </div>
              <div className={`p-2 rounded ${debugInfo.userInStore?.includes('✅') ? 'bg-green-100' : 'bg-yellow-100'}`}>
                Usuario: {debugInfo.userInStore?.split(' ')[0] || '❌'}
              </div>
              <div className={`p-2 rounded ${debugInfo.localStorage?.auth_user === '✅' ? 'bg-green-100' : 'bg-gray-100'}`}>
                LocalStorage: {debugInfo.localStorage?.auth_user || '❌'}
              </div>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              <p className="font-medium">📝 Usa estas credenciales:</p>
              <ul className="mt-1 space-y-1">
                <li>• prueba@correo.com / 123456</li>
                <li>• admin@logistica.com / admin123</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login