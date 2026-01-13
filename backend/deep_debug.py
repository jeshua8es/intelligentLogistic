# deep_debug.py
import os
import sys
import jwt
import requests
import json
from dotenv import load_dotenv

sys.path.insert(0, os.getcwd())
load_dotenv()

print("🔍 DEBUG PROFUNDO - ALGORITMO NO SOPORTADO")
print("=" * 60)

# 1. Leer token
with open('.supabase_token.txt', 'r') as f:
    token = f.read().strip()

print(f"1. Token ({len(token)} chars): {token[:50]}...")

# 2. Analizar header
header = jwt.get_unverified_header(token)
print(f"\n2. Token header:")
print(f"   alg: {header.get('alg')}")
print(f"   kid: {header.get('kid')}")

# 3. Verificar algoritmos soportados
print(f"\n3. Algoritmos disponibles en PyJWT:")
algorithms = jwt.algorithms.get_default_algorithms()
print(f"   Total: {len(algorithms)} algoritmos")

# Verificar ES256 específicamente
if 'ES256' in algorithms:
    print(f"   ✅ ES256 está disponible")
    es256_class = algorithms['ES256']
    print(f"   Clase: {es256_class}")
else:
    print(f"   ❌ ES256 NO disponible")

# 4. Obtener JWKS
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
headers = {'apikey': SUPABASE_KEY}

print(f"\n4. Obteniendo JWKS de Supabase...")
print(f"   URL: {jwks_url}")

response = requests.get(jwks_url, headers=headers, timeout=5)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    jwks = response.json()
    print(f"   ✅ JWKS obtenido")
    print(f"   Claves: {len(jwks.get('keys', []))}")
    
    # Buscar clave
    kid = header.get('kid')
    key_found = None
    
    for key in jwks.get('keys', []):
        if key.get('kid') == kid:
            key_found = key
            print(f"\n5. Clave encontrada:")
            print(f"   kty: {key.get('kty')}")
            print(f"   alg: {key.get('alg')}")
            print(f"   crv: {key.get('crv')}")
            print(f"   x: {key.get('x')[:20]}...")
            print(f"   y: {key.get('y')[:20]}...")
            break
    
    if key_found:
        # 6. Probar diferentes métodos de verificación
        print(f"\n6. Probando métodos de verificación:")
        
        # Método 1: Usar jwt.decode con key dict
        print(f"   Método 1: jwt.decode con dict JWK")
        try:
            payload = jwt.decode(
                token,
                key=key_found,
                algorithms=['ES256'],
                audience='authenticated',
                issuer=f"{SUPABASE_URL}/auth/v1"
            )
            print(f"      ✅ ¡Funciona! Usuario: {payload.get('email')}")
        except Exception as e:
            print(f"      ❌ Error: {type(e).__name__}: {e}")
        
        # Método 2: Convertir JWK a clave EC
        print(f"\n   Método 2: Convertir JWK EC a clave")
        try:
            from cryptography.hazmat.primitives.asymmetric import ec
            from cryptography.hazmat.primitives import serialization
            import base64
            
            # Decodificar coordenadas
            x = base64.urlsafe_b64decode(key_found['x'] + '==')
            y = base64.urlsafe_b64decode(key_found['y'] + '==')
            
            public_numbers = ec.EllipticCurvePublicNumbers(
                x=int.from_bytes(x, 'big'),
                y=int.from_bytes(y, 'big'),
                curve=ec.SECP256R1()
            )
            
            public_key = public_numbers.public_key()
            
            # Convertir a PEM
            pem = public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
            
            print(f"      ✅ Clave EC creada")
            print(f"      PEM (primeros 80 chars): {pem[:80].decode()}...")
            
            # Probar verificación con PEM
            payload = jwt.decode(
                token,
                pem,
                algorithms=['ES256'],
                audience='authenticated',
                issuer=f"{SUPABASE_URL}/auth/v1"
            )
            print(f"      ✅ ¡Verificación con PEM funciona! Usuario: {payload.get('email')}")
            
        except Exception as e:
            print(f"      ❌ Error: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
        
        # Método 3: Usar la librería jwt directamente con from_jwk
        print(f"\n   Método 3: jwt.algorithms.ECAlgorithm.from_jwk")
        try:
            public_key = jwt.algorithms.ECAlgorithm.from_jwk(key_found)
            print(f"      ✅ Clave creada con ECAlgorithm.from_jwk")
            
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['ES256'],
                audience='authenticated',
                issuer=f"{SUPABASE_URL}/auth/v1"
            )
            print(f"      ✅ ¡Funciona con ECAlgorithm! Usuario: {payload.get('email')}")
            
        except Exception as e:
            print(f"      ❌ Error: {type(e).__name__}: {e}")
            
else:
    print(f"   ❌ Error obteniendo JWKS: {response.text}")