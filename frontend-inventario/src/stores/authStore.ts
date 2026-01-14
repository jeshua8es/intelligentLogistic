import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
  clearAuth: () => void; // Nueva función
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  // Inicializar autenticación - MODIFICADO: No restaurar automáticamente
  initializeAuth: () => {
    console.log('🔄 Inicializando autenticación...');
    
    // SOLO para debug: mostrar estado actual
    const storedUser = localStorage.getItem('auth_user');
    console.log('📦 Usuario en localStorage:', storedUser ? 'SÍ' : 'NO');
    
    // Limpiar errores pero NO restaurar usuario
    set({ error: null });
    
    // NOTA: Comentamos la restauración automática
    // if (storedUser) {
    //   try {
    //     const user = JSON.parse(storedUser);
    //     set({ user });
    //     console.log('✅ Usuario restaurado:', user.email);
    //   } catch (error) {
    //     console.error('❌ Error parsing user:', error);
    //     localStorage.removeItem('auth_user');
    //   }
    // }
  },

  // Login - MODIFICADO para ser más claro
  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      console.log('🔐 Procesando login para:', email);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Credenciales válidas
      const validUsers = [
        { email: 'prueba@correo.com', password: '123456', name: 'Usuario Prueba', role: 'admin' },
        { email: 'admin@logistica.com', password: 'admin123', name: 'Administrador', role: 'superadmin' },
        { email: 'test@example.com', password: 'test123', name: 'Test User', role: 'user' },
      ];
      
      const userFound = validUsers.find(
        user => user.email === email && user.password === password
      );
      
      if (userFound) {
        const user: User = {
          id: 'user-' + Date.now(),
          email: userFound.email,
          name: userFound.name,
          role: userFound.role
        };
        
        // Guardar en localStorage
        localStorage.setItem('auth_user', JSON.stringify(user));
        
        set({ 
          user,
          loading: false 
        });
        
        console.log('✅ Login exitoso:', user.email);
        return;
      }
      
      throw new Error('Credenciales incorrectas. Usa: prueba@correo.com / 123456');
      
    } catch (err: any) {
      console.error('❌ Error en login:', err.message);
      set({ 
        error: err.message,
        loading: false 
      });
      throw err;
    }
  },

  // Logout - MEJORADO: Limpiar todo
  logout: async () => {
    console.log('👋 Ejecutando logout...');
    
    // Limpiar localStorage completamente
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    
    // Limpiar sessionStorage por si acaso
    sessionStorage.clear();
    
    // Resetear el store
    set({ 
      user: null,
      error: null,
      loading: false 
    });
    
    console.log('✅ Logout completo, usuario eliminado');
  },

  // Función para limpiar todo (debug)
  clearAuth: () => {
    console.log('🧹 Limpiando autenticación...');
    localStorage.clear();
    sessionStorage.clear();
    set({ user: null, error: null, loading: false });
  },

  // Limpiar errores
  clearError: () => {
    set({ error: null });
  }
}));