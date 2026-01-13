# get_fresh_token.py
import requests
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')

print("🆕 OBTENIENDO TOKEN NUEVO DE SUPABASE")
print("=" * 60)

credentials = {
    'email': 'test@logistica.com',
    'password': 'TestPassword123'
}

auth_url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
}

print(f"URL: {SUPABASE_URL}")
print(f"User: {credentials['email']}")

try:
    response = requests.post(auth_url, json=credentials, headers=headers, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        token = data['access_token']
        
        print(f"\n✅ NUEVO TOKEN OBTENIDO:")
        print(f"   Email: {data.get('user', {}).get('email')}")
        print(f"   Token: {token[:50]}...")
        
        # Guardar
        with open('.supabase_token.txt', 'w') as f:
            f.write(token)
        print(f"📝 Token guardado en .supabase_token.txt")
        
        # Probar inmediatamente con Django
        print(f"\n🧪 PROBANDO CON DJANGO...")
        django_url = "http://localhost:8000/api/test/protected/"
        headers = {'Authorization': f'Bearer {token}'}
        
        try:
            r = requests.get(django_url, headers=headers, timeout=5)
            if r.status_code == 200:
                print(f"✅ ¡JWT FUNCIONA! Respuesta: {r.json()}")
            else:
                print(f"❌ Error Django {r.status_code}: {r.text}")
        except:
            print("⚠️  Django no está corriendo o hay error de conexión")
            
    elif response.status_code == 400:
        print(f"\n❌ Error 400: {response.json().get('error_description', 'Unknown error')}")
        print("\n💡 ¿CREASTE EL USUARIO test@logistica.com EN SUPABASE?")
        
    else:
        print(f"\n❌ Error {response.status_code}: {response.text}")
        
except Exception as e:
    print(f"\n❌ Error: {type(e).__name__}: {e}")