// src/stores/authStore.ts - VERSIÓN QUE FUNCIONA AHORA MISMO
import { create } from "zustand";
import { createClient } from '@supabase/supabase-js'; // Añade esta línea

// Cliente Supabase (modo desarrollo)
const getSupabaseClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-clave-publica';
  
  console.log('🔧 Configurando Supabase...');
  
  // Validar si las credenciales son reales o de ejemplo
  const isDemoMode = supabaseUrl.includes('tu-proyecto') || supabaseKey.includes('tu-clave');
  
  if (isDemoMode) {
    console.warn('⚠️ MODO DESARROLLO: Usando autenticación simulada');
    console.log('📧 Usa: prueba@correo.com / 123456');
  } else {
    console.log('✅ Credenciales Supabase configuradas');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  });
};

const supabase = getSupabaseClient();

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,

  initializeAuth: () => {
    console.log('🔄 Inicializando autenticación...');
    
    // 1. Primero intentar con localStorage (modo desarrollo)
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        set({ user });
        console.log('✅ Usuario recuperado de localStorage:', user.email);
        return;
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    
    // 2. Si no hay en localStorage, verificar Supabase
    const checkSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || ''
          };
          set({ user });
          console.log('✅ Sesión Supabase activa:', user.email);
        }
      } catch (error) {
        console.log('ℹ️ No hay sesión Supabase activa');
      }
    };
    
    checkSupabaseSession();
    set({ error: null });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔐 Procesando login para:', email);
      
      // CREDENCIALES DE PRUEBA (modo desarrollo)
      const testCredentials = [
        { email: 'prueba@correo.com', password: '123456' },
        { email: 'admin@logistica.com', password: 'admin123' },
        { email: 'test@example.com', password: 'test123' },
        { email: 'user@example.com', password: 'password' }
      ];
      
      // Verificar si es un usuario de prueba
      const isTestUser = testCredentials.some(
        cred => cred.email === email && cred.password === password
      );
      
      if (isTestUser) {
        console.log('✅ Login de prueba exitoso');
        
        // Crear usuario simulado
        const mockUser = {
          id: 'dev-' + Date.now(),
          email: email,
          name: email.split('@')[0],
          role: 'admin'
        };
        
        // Guardar en localStorage
        localStorage.setItem('auth_user', JSON.stringify(mockUser));
        localStorage.setItem('auth_token', 'dev-token-' + Date.now());
        
        // Pequeño delay para simular red
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set({ 
          user: mockUser,
          loading: false 
        });
        
        return;
      }
      
      // Si no es usuario de prueba, intentar con Supabase REAL
      console.log('🌐 Intentando autenticación real con Supabase...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw new Error(`Supabase: ${error.message}`);
      }
      
      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || ''
        };
        
        console.log('✅ Login Supabase exitoso:', user.email);
        
        set({ 
          user,
          loading: false 
        });
      }
      
    } catch (err: any) {
      console.error('❌ Error en login:', err.message);
      
      // Mensajes de error amigables
      let errorMessage = 'Error de autenticación';
      
      if (err.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos';
      } else if (err.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email primero';
      } else if (err.message.includes('Supabase:')) {
        errorMessage = err.message.replace('Supabase: ', '');
      }
      
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      throw err;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Sesión Supabase cerrada');
    } catch (error) {
      console.warn('⚠️ Error al cerrar sesión Supabase:', error);
    }
    
    // Limpiar localStorage
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    
    set({ user: null });
    console.log('👋 Usuario deslogueado');
  },

  clearError: () => {
    set({ error: null });
  }
}));