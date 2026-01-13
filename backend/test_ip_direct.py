# test_ip_direct.py
import psycopg2

print("🔍 PROBANDO CONEXIÓN CON IP DIRECTA")
print("=" * 50)

# Lista de IPs de Supabase (AWS us-east-1)
ips = [
    ("34.86.253.161", "Virginia 1"),
    ("34.86.79.79", "Virginia 2"),
    ("35.245.161.88", "Iowa"),
    ("34.172.210.119", "Oregon"),
    ("34.106.109.131", "London"),
]

password = "TU_PASSWORD_AQUI"  # Tu password real

for ip, location in ips:
    print(f"\n📍 Probando {location} ({ip})...")
    try:
        conn = psycopg2.connect(
            host=ip,
            port=5432,
            database='postgres',
            user='postgres',
            password=password,
            connect_timeout=5,
            sslmode='require'
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"   ✅ CONEXIÓN EXITOSA!")
        print(f"   • {version.split(',')[0]}")
        
        # Verificar nuestras tablas
        cursor.execute("SELECT COUNT(*) FROM regions;")
        count = cursor.fetchone()[0]
        print(f"   • Regiones en DB: {count}")
        
        conn.close()
        
        print(f"\n🎉 ¡USA ESTA IP EN TU .env!")
        print(f"DATABASE_URL=postgresql://postgres:{password}@{ip}:5432/postgres")
        break
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:80]}...")