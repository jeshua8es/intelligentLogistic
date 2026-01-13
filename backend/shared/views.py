# shared/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import json

class TestProtectedView(APIView):
    """
    Vista PROTEGIDA - requiere token JWT válido.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # request.user será tu objeto SupabaseUser
        return Response({
            'status': 'success',
            'message': '¡Autenticación JWT exitosa!',
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'role': request.user.role,
                'is_authenticated': request.user.is_authenticated,
            },
            'token_info': {
                'type': str(type(request.auth)),
                'length': len(request.auth) if request.auth else 0,
            }
        })

class TestPublicView(APIView):
    """
    Vista PÚBLICA - no requiere autenticación.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'success',
            'message': 'Esta es una vista pública',
            'user_info': {
                'authenticated': request.user.is_authenticated if request.user else False,
                'user': str(request.user) if request.user else 'Anónimo',
                'auth_header': request.headers.get('Authorization', 'No header'),
            }
        })

class TestHealthView(APIView):
    """
    Vista de salud del sistema.
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'Logística Inteligente API',
            'authentication': 'Supabase JWT',
            'timestamp': '2024-01-15T10:30:00Z',
        })