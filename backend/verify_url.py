# test_new_key.py
import requests

URL = "https://qqndelvjwltmjelduzlz.supabase.co"
API_KEY = "sb_publishable_nBqMThJ91kXN8qpQG-25Tw_-orShhFr"

print("🔑 PROBANDO NUEVA API KEY")
print("=" * 60)
print(f"URL: {URL}")
print(f"Key: {API_KEY}")

endpoints = [
    ("/auth/v1/jwks", "JWKS"),
    ("/auth/v1/.well-known/jwks.json", "JWKS alternativa"),
]

for endpoint, name in endpoints:
    full_url = URL + endpoint
    print(f"\n🔗 {name}: {full_url}")
    
    headers = {
        'apikey': API_KEY,
        'Authorization': f'Bearer {API_KEY}'
    }
    
    try:
        response = requests.get(full_url, headers=headers, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ ¡ÉXITO! Endpoint accesible")
            if 'jwks' in endpoint:
                data = response.json()
                print(f"   Claves disponibles: {len(data.get('keys', []))}")
                
                # Mostrar primera clave
                if data.get('keys'):
                    key = data['keys'][0]
                    print(f"   kid: {key.get('kid')}")
                    print(f"   alg: {key.get('alg')}")
        elif response.status_code == 401:
            print("   ❌ 401 Unauthorized - Key aún inválida")
        else:
            print(f"   ❌ Error {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error: {type(e).__name__}: {e}")

print("\n" + "=" * 60)
print("📝 Si funciona, actualiza tu .env con:")
print(f"SUPABASE_ANON_KEY={API_KEY}")
print("=" * 60)