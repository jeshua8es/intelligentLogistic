# get_supabase_token.py
import requests
import os
import sys
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://qandelylvtlmjelduziz.supabase.co')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY', 'sb_publishable_nBqMThJ9tlXN8apQG-25Tw_~orShhFr')

print("🔐 OBTENIENDO TOKEN JWT DE TU SUPABASE")
print("=" * 60)
print(f"Proyecto: {SUPABASE_URL}")
print(f"API Key: {SUPABASE_ANON_KEY[:30]}...")

# Credenciales del usuario que DEBES crear en Supabase
credentials = {
    'email': 'test@logistica.com',  # ¡CREA ESTE USUARIO PRIMERO!
    'password': 'TestPassword123'
}

def get_jwt_token():
    """Obtiene token JWT de Supabase"""
    auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    
    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    }
    
    print(f"\n📡 Intentando login en Supabase...")
    print(f"   Usuario: {credentials['email']}")
    
    try:
        response = requests.post(auth_url, json=credentials, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            token = data['access_token']
            user = data.get('user', {})
            
            print(f"\n✅ ¡ÉXITO! Token JWT obtenido")
            print(f"   Usuario: {user.get('email')}")
            print(f"   ID: {user.get('id', '')[:8]}...")
            print(f"   Token: {token[:50]}...")
            
            # Guardar token
            with open('.supabase_token.txt', 'w') as f:
                f.write(token)
            print(f"\n📝 Token guardado en: .supabase_token.txt")
            
            return token
            
        elif response.status_code == 400:
            print(f"\n❌ Error 400: {response.json().get('error_description', 'Unknown error')}")
            print("\n💡 ¿CREASTE EL USUARIO EN SUPABASE?")
            print("   Ve a: Authentication → Users → Add User")
            print(f"   Email: {credentials['email']}")
            print(f"   Password: {credentials['password']}")
            
        else:
            print(f"\n❌ Error {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ No se puede conectar a Supabase. Verifica:")
        print("   - Internet")
        print(f"   - URL: {SUPABASE_URL}")
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}: {e}")

def test_django_with_token(token):
    """Prueba el token con Django"""
    print("\n" + "=" * 60)
    print("🧪 PROBANDO TOKEN CON DJANGO")
    print("=" * 60)
    
    django_url = "http://localhost:8000/api/test/protected/"
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"URL Django: {django_url}")
    print(f"Headers: Authorization: Bearer {token[:30]}...")
    
    try:
        response = requests.get(django_url, headers=headers, timeout=5)
        
        print(f"\n📡 Respuesta de Django:")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ ¡AUTENTICACIÓN JWT EXITOSA!")
            print(f"   Datos: {response.json()}")
        elif response.status_code == 401:
            print("   ❌ 401 Unauthorized - Token no válido")
            print(f"   Error: {response.text}")
        else:
            print(f"   ❌ Error {response.status_code}")
            print(f"   Respuesta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Django no está corriendo o no se puede conectar")
        print("   Ejecuta: python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error probando Django: {e}")

if __name__ == "__main__":
    # Primero obtener token
    token = get_jwt_token()
    
    if token:
        # Probar con Django
        test_django_with_token(token)
        
        # Mostrar comando para probar manualmente
        print("\n" + "=" * 60)
        print("📋 COMANDO PARA PROBAR MANUALMENTE:")
        print("=" * 60)
        print(f"curl -H 'Authorization: Bearer {token[:30]}...' \\")
        print("     http://localhost:8000/api/test/protected/")