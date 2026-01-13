# create_working_auth.py
print("🚀 CREANDO VERSIÓN FUNCIONAL DE authentication.py")
print("=" * 60)

working_auth = '''
"""
AUTENTICACIÓN JWT PARA SUPABASE - VERSIÓN FUNCIONAL CON cryptography
"""
import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework.exceptions import AuthenticationFailed
import requests
import json
import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization

class SupabaseJWTAuthentication(authentication.BaseAuthentication):
    """
    Autenticación JWT para Supabase - Versión que SÍ funciona con ES256
    """
    
    def authenticate(self, request):
        print("🔍 [AUTH] Iniciando autenticación JWT")
        
        # Extraer token
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            print("   [AUTH] No hay header Authorization")
            return None
            
        print(f"   [AUTH] Header encontrado: {auth_header[:50]}...")
        
        # Verificar formato
        if not auth_header.startswith('Bearer '):
            print("   [AUTH] Formato incorrecto (no empieza con 'Bearer ')")
            return None
            
        token = auth_header[7:]  # Remover 'Bearer '
        print(f"   [AUTH] Token extraído: {token[:30]}...")
        
        # Validar token
        print("   [AUTH] Validando token...")
        user_data = self.validate_token(token)
        
        if not user_data:
            print("   [AUTH] Token inválido")
            raise AuthenticationFailed('Token inválido o expirado')
            
        print(f"   [AUTH] Token válido. Usuario: {user_data.get('email')}")
        
        # Crear usuario
        user = self.create_user_from_token(user_data)
        
        return (user, token)
    
    def validate_token(self, token: str):
        """
        Validar token JWT - Versión que funciona con ES256 usando cryptography
        """
        try:
            print("      [AUTH] Obteniendo JWKS de Supabase...")
            
            # URL de JWKS
            jwks_url = f"{settings.SUPABASE_CONFIG['url']}/auth/v1/.well-known/jwks.json"
            headers = {'apikey': settings.SUPABASE_CONFIG['anon_key']}
            
            print(f"      [AUTH] URL: {jwks_url}")
            
            response = requests.get(jwks_url, headers=headers, timeout=10)
            print(f"      [AUTH] Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"      [AUTH] Error HTTP: {response.status_code}")
                return None
                
            jwks = response.json()
            print(f"      [AUTH] JWKS obtenido. Claves: {len(jwks.get('keys', []))}")
            
            # Obtener header del token
            header = jwt.get_unverified_header(token)
            print(f"      [AUTH] Header: alg={header.get('alg')}, kid={header.get('kid')}")
            
            # Buscar clave
            kid = header.get('kid')
            key_found = None
            
            for key in jwks.get('keys', []):
                if key.get('kid') == kid:
                    key_found = key
                    print(f"      [AUTH] Clave encontrada: {key.get('kid')}")
                    break
            
            if not key_found:
                print(f"      [AUTH] No se encontró clave con kid={kid}")
                return None
            
            # Determinar algoritmo
            algorithm = key_found.get('alg', 'ES256')
            print(f"      [AUTH] Algoritmo: {algorithm}")
            
            if algorithm == 'ES256':
                # Para ES256: convertir JWK EC a clave pública usando cryptography
                print("      [AUTH] Convirtiendo JWK EC a clave pública...")
                
                # Decodificar coordenadas base64 URL-safe
                x = base64.urlsafe_b64decode(key_found['x'] + '==')
                y = base64.urlsafe_b64decode(key_found['y'] + '==')
                
                # Crear números públicos EC
                public_numbers = ec.EllipticCurvePublicNumbers(
                    x=int.from_bytes(x, 'big'),
                    y=int.from_bytes(y, 'big'),
                    curve=ec.SECP256R1()  # P-256 curve
                )
                
                # Crear clave pública
                public_key = public_numbers.public_key()
                
                # Convertir a formato PEM (PyJWT lo necesita así)
                pem = public_key.public_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PublicFormat.SubjectPublicKeyInfo
                )
                
                print("      [AUTH] Clave PEM creada")
                
                # Verificar token con la clave PEM
                print("      [AUTH] Verificando firma ES256...")
                payload = jwt.decode(
                    token,
                    pem,
                    algorithms=['ES256'],
                    audience='authenticated',
                    issuer=f"{settings.SUPABASE_CONFIG['url']}/auth/v1"
                )
                
                print(f"      [AUTH] ¡Token ES256 válido! Usuario: {payload.get('email')}")
                return payload
                
            elif algorithm == 'RS256':
                # Para RS256: PyJWT puede manejar JWK directamente
                print("      [AUTH] Verificando firma RS256...")
                payload = jwt.decode(
                    token,
                    key=key_found,
                    algorithms=['RS256'],
                    audience='authenticated',
                    issuer=f"{settings.SUPABASE_CONFIG['url']}/auth/v1"
                )
                print(f"      [AUTH] ¡Token RS256 válido! Usuario: {payload.get('email')}")
                return payload
                
            else:
                print(f"      [AUTH] Algoritmo no soportado: {algorithm}")
                return None
                
        except jwt.ExpiredSignatureError:
            print("      [AUTH] Token expirado")
            return None
        except jwt.InvalidTokenError as e:
            print(f"      [AUTH] Token inválido: {e}")
            return None
        except Exception as e:
            print(f"      [AUTH] Error inesperado: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def create_user_from_token(self, payload):
        """
        Crear objeto usuario Django.
        """
        class SupabaseUser:
            def __init__(self, token_payload):
                self.id = token_payload.get('sub')
                self.email = token_payload.get('email')
                self.role = token_payload.get('role', 'authenticated')
                self.user_metadata = token_payload.get('user_metadata', {})
                self.app_metadata = token_payload.get('app_metadata', {})
                self.is_authenticated = True
                self.is_anonymous = False
                self.username = self.email
                print(f"      [AUTH] Usuario creado: {self.email}")
            
            def __str__(self):
                return self.email or self.id
            
            def get_username(self):
                return self.email
            
            def has_perm(self, perm, obj=None):
                return self.role == 'service_role'
            
            def has_module_perms(self, app_label):
                return True
        
        return SupabaseUser(payload)
'''

# Guardar
with open('shared/authentication.py', 'w', encoding='utf-8') as f:
    f.write(working_auth)

print("✅ authentication.py REEMPLAZADO con versión funcional")
print("📍 Usa cryptography para ES256 con conversión JWK→PEM")

# Verificar
print("\n🔍 VERIFICACIÓN RÁPIDA:")
with open('shared/authentication.py', 'r') as f:
    lines = f.readlines()
    print(f"Líneas totales: {len(lines)}")
    print("Contiene 'cryptography':", any('cryptography' in line for line in lines))
    print("Contiene 'ECAlgorithm':", any('ECAlgorithm' in line for line in lines))
    print("Contiene 'from cryptography':", any('from cryptography' in line for line in lines))