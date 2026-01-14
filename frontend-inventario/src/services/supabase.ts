// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'

// 1. Variables de entorno (las pondrás en .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 2. Validación
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// 3. Cliente de Supabase con configuración de Auth (si está configurado)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        // IMPORTANTE: Persiste el JWT automáticamente
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

// 4. Tipos para TypeScript (opcional pero recomendado)
export type { Session, User } from '@supabase/supabase-js'