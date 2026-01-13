"""
Cliente para interactuar con Supabase via REST API.
Esta es la solución temporal mientras resolvemos la conexión directa PostgreSQL.
"""

import os
import requests
import json
from django.conf import settings
from typing import Optional, List, Dict, Any

class SupabaseClient:
    """
    Cliente para interactuar con Supabase via REST API.
    
    Características:
    - Autenticación JWT
    - CRUD completo para todas las tablas
    - Manejo de errores robusto
    - Timeouts configurables
    """
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Inicializar cliente Supabase.
        
        Args:
            api_key: Clave API de Supabase (anon o service_role)
            base_url: URL base de Supabase
        """
        self.base_url = base_url or settings.SUPABASE_CONFIG['url']
        self.api_key = api_key or settings.SUPABASE_CONFIG['anon_key']
        self.default_headers = {
            'apikey': self.api_key,
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'  # Retornar datos insertados/actualizados
        }
        self.timeout = 15  # segundos
    
    def _make_request(self, method: str, endpoint: str, 
                     data: Optional[Dict] = None, 
                     params: Optional[Dict] = None,
                     headers: Optional[Dict] = None) -> Optional[Any]:
        """
        Método genérico para realizar requests a la API de Supabase.
        
        Args:
            method: Método HTTP (GET, POST, PATCH, DELETE)
            endpoint: Endpoint de la API (ej: 'regions', 'regional_inventory')
            data: Datos para POST/PATCH
            params: Parámetros de query string
            headers: Headers adicionales
            
        Returns:
            Datos de respuesta o None si hay error
        """
        url = f"{self.base_url}/rest/v1/{endpoint}"
        request_headers = {**self.default_headers, **(headers or {})}
        
        try:
            response = requests.request(
                method=method.upper(),
                url=url,
                headers=request_headers,
                json=data,
                params=params,
                timeout=self.timeout
            )
            
            # Log para debugging (solo en desarrollo)
            if settings.DEBUG:
                print(f"Supabase API Request: {method} {url}")
                print(f"Status: {response.status_code}")
                if response.status_code not in [200, 201, 204]:
                    print(f"Error: {response.text[:200]}")
            
            if response.status_code in [200, 201]:
                return response.json() if response.content else True
            elif response.status_code == 204:
                return True  # No content (DELETE exitoso)
            else:
                print(f"Supabase API Error {response.status_code}: {response.text[:200]}")
                return None
                
        except requests.exceptions.Timeout:
            print(f"Supabase API Timeout: {method} {endpoint}")
            return None
        except requests.exceptions.ConnectionError:
            print(f"Supabase API Connection Error: {method} {endpoint}")
            return None
        except Exception as e:
            print(f"Supabase API Unexpected Error: {e}")
            return None
    
    # ============================================
    # MÉTODOS DE AUTENTICACIÓN
    # ============================================
    
    def login(self, email: str, password: str) -> Optional[Dict]:
        """
        Iniciar sesión y obtener token JWT.
        
        Args:
            email: Correo electrónico del usuario
            password: Contraseña
            
        Returns:
            Diccionario con token y datos de usuario, o None si falla
        """
        auth_url = f"{self.base_url}/auth/v1/token?grant_type=password"
        
        try:
            response = requests.post(
                auth_url,
                headers={
                    'apikey': self.api_key,
                    'Content-Type': 'application/json'
                },
                json={'email': email, 'password': password},
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                # Actualizar headers con el nuevo token
                self.default_headers['Authorization'] = f'Bearer {data["access_token"]}'
                return data
            else:
                print(f"Login Error {response.status_code}: {response.text[:100]}")
                return None
                
        except Exception as e:
            print(f"Login Connection Error: {e}")
            return None
    
    def logout(self) -> bool:
        """Cerrar sesión."""
        auth_url = f"{self.base_url}/auth/v1/logout"
        
        try:
            response = requests.post(
                auth_url,
                headers=self.default_headers,
                timeout=self.timeout
            )
            return response.status_code == 204
        except:
            return False
    
    def get_current_user(self) -> Optional[Dict]:
        """Obtener información del usuario actual."""
        auth_url = f"{self.base_url}/auth/v1/user"
        
        try:
            response = requests.get(
                auth_url,
                headers=self.default_headers,
                timeout=self.timeout
            )
            return response.json() if response.status_code == 200 else None
        except:
            return None
    
    # ============================================
    # MÉTODOS PARA REGIONES
    # ============================================
    
    def get_regions(self, filters: Optional[Dict] = None) -> List[Dict]:
        """
        Obtener todas las regiones.
        
        Args:
            filters: Filtros opcionales (ej: {'climate_type': 'eq.tropical'})
            
        Returns:
            Lista de regiones
        """
        params = filters or {}
        return self._make_request('GET', 'regions', params=params) or []
    
    def get_region(self, region_id: str) -> Optional[Dict]:
        """Obtener una región específica por ID."""
        result = self._make_request('GET', f'regions?id=eq.{region_id}')
        return result[0] if result and len(result) > 0 else None
    
    def create_region(self, data: Dict) -> Optional[Dict]:
        """Crear una nueva región."""
        return self._make_request('POST', 'regions', data=data)
    
    def update_region(self, region_id: str, data: Dict) -> Optional[Dict]:
        """Actualizar una región existente."""
        return self._make_request('PATCH', f'regions?id=eq.{region_id}', data=data)
    
    def delete_region(self, region_id: str) -> bool:
        """Eliminar una región."""
        return self._make_request('DELETE', f'regions?id=eq.{region_id}') is True
    
    # ============================================
    # MÉTODOS PARA INVENTARIO REGIONAL
    # ============================================
    
    def get_inventory(self, filters: Optional[Dict] = None) -> List[Dict]:
        """
        Obtener inventario regional.
        
        Args:
            filters: Filtros (ej: {'region_id': 'eq.uuid', 'quantity': 'gt.10'})
            
        Returns:
            Lista de items de inventario
        """
        params = filters or {}
        return self._make_request('GET', 'regional_inventory', params=params) or []
    
    def get_inventory_by_region(self, region_id: str) -> List[Dict]:
        """Obtener inventario de una región específica."""
        return self.get_inventory({'region_id': f'eq.{region_id}'})
    
    def create_inventory_item(self, data: Dict) -> Optional[Dict]:
        """Crear un nuevo item de inventario."""
        return self._make_request('POST', 'regional_inventory', data=data)
    
    def update_inventory_quantity(self, inventory_id: str, new_quantity: int) -> Optional[Dict]:
        """Actualizar cantidad de un item de inventario."""
        return self._make_request('PATCH', f'regional_inventory?id=eq.{inventory_id}', 
                                 data={'quantity': new_quantity})
    
    # ============================================
    # MÉTODOS PARA SUCURSALES
    # ============================================
    
    def get_branches(self, active_only: bool = True) -> List[Dict]:
        """
        Obtener todas las sucursales.
        
        Args:
            active_only: Si True, solo devuelve sucursales activas
            
        Returns:
            Lista de sucursales
        """
        filters = {'is_active': 'eq.true'} if active_only else {}
        return self._make_request('GET', 'branches', params=filters) or []
    
    def get_branch(self, branch_code: str) -> Optional[Dict]:
        """Obtener una sucursal específica por código."""
        result = self._make_request('GET', f'branches?branch_code=eq.{branch_code}')
        return result[0] if result and len(result) > 0 else None
    
    # ============================================
    # MÉTODOS DE UTILIDAD
    # ============================================
    
    def health_check(self) -> bool:
        """Verificar que la API esté funcionando."""
        try:
            response = requests.get(
                f"{self.base_url}/rest/v1/",
                headers={'apikey': self.api_key},
                timeout=5
            )
            return response.status_code == 200
        except:
            return False
    
    def get_table_count(self, table_name: str) -> int:
        """Obtener conteo de registros en una tabla."""
        params = {
            'select': 'count',
            'count': 'exact'
        }
        result = self._make_request('GET', table_name, params=params)
        return result[0]['count'] if result else 0