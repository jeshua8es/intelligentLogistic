# inventory/views.py
"""
Vistas (Views) del módulo de inventario.

Las views son como los 'controladores' en Django:
- Reciben requests HTTP (GET, POST, etc.)
- Procesan la lógica
- Retornan responses HTTP

En nuestro caso, vamos a crear APIs REST que:
1. Validen el token JWT de Supabase
2. Devuelvan datos JSON
"""

# Importamos lo necesario de Django REST Framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import ProductoLocal  
from rest_framework import serializers


class HelloWorldAPIView(APIView):
    permission_classes = []  # Sin autenticación por ahora
    
    def get(self, request):
        """
        Endpoint simple de prueba SIN autenticación.
        
        IMPORTANTE: Cuando permission_classes está vacío,
        request.user es AnonymousUser (no tiene email, id, etc.)
        """
        
        # Verificar si el usuario está autenticado
        is_authenticated = request.user.is_authenticated
        
        # Preparar datos del usuario de manera segura
        user_data = {}
        if is_authenticated:
            # Si está autenticado, intentar obtener sus datos
            # PERO CUIDADO: Nuestro SupabaseUser tiene email, AnonymousUser NO
            try:
                user_data = {
                    'id': getattr(request.user, 'id', 'N/A'),
                    'email': getattr(request.user, 'email', 'N/A'),
                    'role': getattr(request.user, 'role', 'anonymous'),
                }
            except AttributeError:
                user_data = {
                    'id': 'unknown',
                    'email': 'anonymous@example.com',
                    'role': 'anonymous',
                }
        else:
            # Usuario anónimo
            user_data = {
                'id': 'anonymous',
                'email': 'anonymous@example.com',
                'role': 'anonymous',
                'note': 'Usuario no autenticado (AnonymousUser)'
            }
        
        # Datos de respuesta
        data = {
            'message': '¡Hola Mundo desde Django + Supabase!',
            'user': user_data,
            'authentication': {
                'is_authenticated': is_authenticated,
                'user_class': request.user.__class__.__name__,
                'has_email_attr': hasattr(request.user, 'email'),
            },
            'timestamp': '2024-01-15T10:30:00Z',  # Ficticio por ahora
            'status': 'success',
            'debug_info': {
                'auth_header': request.headers.get('Authorization', 'No header'),
                'note': 'Autenticación JWT desactivada temporalmente'
            }
        }
        
        return Response(data, status=status.HTTP_200_OK)
    
class SimpleHelloAPIView(APIView):
    def get(self, request):
        return Response({
            'message': '¡Hola! Django funciona correctamente.',
            'status': 'success',
            'endpoint': '/api/simple-hello/',
            'next_step': 'Ahora podemos agregar autenticación'
        })
    
# ============================================
# SERIALIZER PARA PRODUCTOS (agregar esto)
# ============================================
class ProductoSerializer(serializers.ModelSerializer):
    """Convierte ProductoLocal a/desde JSON."""
    
    class Meta:
        model = ProductoLocal
        fields = ['id', 'nombre', 'descripcion', 'cantidad', 'precio', 'fecha_creacion', 'activo']
        read_only_fields = ['fecha_creacion']


# ============================================
# CLASE QUE FALTA (agregar esto)
# ============================================
class ProductosLocalesAPIView(APIView):
    """
    API para productos en SQLite local.
    
    Endpoints:
    - GET /api/productos-locales/ → Lista todos los productos
    - POST /api/productos-locales/ → Crea nuevo producto
    
    REQUIERE: Header Authorization: Bearer <token_supabase>
    """
    
    def get(self, request):
        """Obtener todos los productos."""
        productos = ProductoLocal.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        
        return Response({
            'success': True,
            'count': productos.count(),
            'productos': serializer.data,
            'database': 'sqlite_local',
        })
    
    def post(self, request):
        """Crear un nuevo producto."""
        serializer = ProductoSerializer(data=request.data)
        
        if serializer.is_valid():
            producto = serializer.save()
            return Response({
                'success': True,
                'message': 'Producto creado',
                'producto': ProductoSerializer(producto).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProtectedTestAPIView(APIView):
    """
    Endpoint de prueba PROTEGIDO que requiere autenticación JWT.
    
    Propósito:
    - Probar que la autenticación JWT funciona
    - Mostrar datos del usuario autenticado
    - Servir como ejemplo para otros endpoints protegidos
    
    Acceso:
    - GET /api/protected-test/
    - REQUIERE: Header Authorization: Bearer <token_supabase>
    """
    
    # NO necesitamos permission_classes aquí porque
    # DEFAULT_PERMISSION_CLASSES en settings ya requiere IsAuthenticated
    
    def get(self, request):
        """
        Maneja GET requests al endpoint protegido.
        
        Este método SOLO se ejecuta si:
        1. El token JWT es válido
        2. SupabaseJWTAuthentication creó request.user
        3. IsAuthenticated permission permite el acceso
        """
        
        # ============================================
        # DATOS DEL USUARIO AUTENTICADO
        # ============================================
        # request.user fue creado por SupabaseJWTAuthentication
        user = request.user
        
        user_info = {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'is_authenticated': user.is_authenticated,
            'user_metadata': user.user_metadata,
            'app_metadata': user.app_metadata,
        }
        
        # ============================================
        # INFORMACIÓN DE LA REQUEST (para debugging)
        # ============================================
        request_info = {
            'method': request.method,
            'path': request.path,
            'content_type': request.content_type,
            'headers': {
                'authorization_present': 'Authorization' in request.headers,
                'authorization_type': request.headers.get('Authorization', '')[:30] + '...' if 'Authorization' in request.headers else None,
            }
        }
        
        # ============================================
        # RESPUESTA
        # ============================================
        response_data = {
            'message': '✅ ¡Acceso concedido! Autenticación JWT funciona.',
            'status': 'success',
            'authentication': {
                'type': 'Supabase JWT',
                'valid': True,
                'user_class': user.__class__.__name__,
            },
            'user': user_info,
            'request': request_info,
            'timestamp': '2024-01-15T10:30:00Z',  # Podríamos usar datetime.now()
            'next_steps': [
                '1. Este endpoint prueba que JWT funciona',
                '2. Ahora puedes proteger otros endpoints',
                '3. El frontend debe enviar token en cada request'
            ]
        }
        
        return Response(response_data, status=status.HTTP_200_OK)