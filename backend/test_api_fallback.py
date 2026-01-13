# test_api_fallback.py
import os
import requests
from dotenv import load_dotenv

load_dotenv()

print("🔍 Probando conexión via REST API")
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

# Esto NO usa DNS para PostgreSQL, solo HTTPS
try:
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/regions",
        headers={
            'apikey': SUPABASE_KEY,
            'Authorization': f'Bearer {SUPABASE_KEY}'
        },
        timeout=10
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ REST API FUNCIONA!")
        print(f"• Status: {response.status_code}")
        print(f"• Regiones obtenidas: {len(data)}")
        for region in data[:3]:
            print(f"  - {region.get('name')}")
    else:
        print(f"❌ API error: {response.status_code}")
        print(response.text[:200])
        
except Exception as e:
    print(f"❌ Error: {e}")