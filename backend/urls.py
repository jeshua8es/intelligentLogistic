# urls.py (en la misma carpeta que settings.py)
"""
Archivo principal de URLs de Django.

Piensa en esto como el 'directorio telefónico' de tu aplicación:
- Define qué URL va a qué vista
- /admin/ → Panel de administración Django
- /api/hello/ → Nuestra vista HelloWorldAPIView
"""

from django.contrib import admin
from django.urls import path, include
from inventory.views import HelloWorldAPIView, SimpleHelloAPIView

from inventory.views import (
    ProductosLocalesAPIView,
    ProtectedTestAPIView
)

urlpatterns = [
    path('admin/', admin.site.urls),
     # Rutas de prueba de autenticación
    path('api/test/', include('shared.urls')),
    
    # Endpoints PÚBLICOS (sin autenticación)
    path('api/simple-hello/', SimpleHelloAPIView.as_view(), name='simple-hello'),
    
    # Endpoints PROTEGIDOS (requieren JWT)
    path('api/hello/', HelloWorldAPIView.as_view(), name='hello-world'),
    path('api/productos-locales/', ProductosLocalesAPIView.as_view(), name='productos-locales'),
    path('api/protected-test/', ProtectedTestAPIView.as_view(), name='protected-test'),
]