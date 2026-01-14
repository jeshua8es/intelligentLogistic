import { create } from 'zustand'
import { debug, warn, error } from '../utils/logger'
import { supabase } from '../lib/supabase' // Asegúrate de tener esto configurado

interface User {
  id: string
  email: string
  role?: string
  name?: string
}

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  // Inicializar autenticación al cargar la app
  initializeAuth: async () => {
    try {
      // Verificar sesión activa en Supabase
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        error('❌ Error obteniendo sesión:', error.message)
        return
      }

      if (session) {
        // Obtener información del usuario
        const { data: userData, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          error('❌ Error obteniendo usuario:', userError.message)
          return
        }

        if (userData.user) {
          const user: User = {
            id: userData.user.id,
            email: userData.user.email || '',
            name: userData.user.user_metadata?.name || ''
          }
          
          set({ user })
          debug('✅ Usuario autenticado encontrado:', user.email)
        }
      } else {
        debug('🔐 No hay sesión activa')
      }
    } catch (error) {
      error('❌ Error en initializeAuth:', error)
    }
  },

  // Login con Supabase
  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    
    try {
      debug('🔐 Intentando login con Supabase:', email)
      
      // 1. Autenticar con Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        error('❌ Error de autenticación Supabase:', error.message)
        throw new Error(error.message)
      }

      if (!data.user || !data.session) {
        throw new Error('No se pudo completar la autenticación')
      }

      // 2. Obtener información adicional del usuario
      const user: User = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || '',
        role: data.user.user_metadata?.role || 'user'
      }

      // 3. Opcional: Llamar a tu backend Django para sincronizar
      try {
        const response = await fetch('http://localhost:8000/api/auth/sync-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({
            supabase_user_id: data.user.id,
            email: data.user.email,
            metadata: data.user.user_metadata
          })
        })

        if (!response.ok) {
          warn('⚠️ No se pudo sincronizar con Django, continuando...')
        }
      } catch (backendError) {
        warn('⚠️ Error al conectar con Django:', backendError)
        // Continuar aunque falle la sincronización con Django
      }

      // 4. Actualizar el store
      set({ 
        user,
        loading: false 
      })
      
      debug('✅ Login exitoso:', user.email)
      
    } catch (err: any) {
      error('❌ Error en login:', err.message)
      
      // Mensajes de error más amigables
      let errorMessage = 'Error en la autenticación'
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos'
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email primero'
      } else if (err.message.includes('Too many requests')) {
        errorMessage = 'Demasiados intentos. Por favor espera unos minutos'
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      })
      throw err
    }
  },

  // Logout
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        error('❌ Error al hacer logout:', error.message)
      }
    } catch (error) {
      error('❌ Error en logout:', error)
    } finally {
      // Limpiar el store
      set({ user: null })
      debug('👋 Usuario deslogueado')
    }
  },

  // Limpiar errores
  clearError: () => {
    set({ error: null })
  }
}))