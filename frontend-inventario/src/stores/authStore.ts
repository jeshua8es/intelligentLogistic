import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  
  // Para prueba
  testConnection: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  
  // Función para probar conexión DESDE EL STORE
  testConnection: async () => {
    set({ loading: true })
    try {
      if (!supabase) {
        // Si Supabase no está configurado no intentamos llamadas remotas
        set({ user: null, session: null, loading: false })
        return
      }

      // Método: Obtener sesión actual
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        set({ loading: false })
        return
      }

      if (session) {
        set({ user: session.user, session: session, loading: false })
      } else {
        set({ loading: false })
      }

    } catch (error: any) {
      set({ loading: false })
    }
  },

  
  // Obtener usuario actual
  getCurrentUser: async () => {
    if (!supabase) {
      set({ user: null })
      return null
    }
    const { data: { user } } = await supabase.auth.getUser()
    set({ user })
    return user
  }
}))
