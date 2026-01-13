import psycopg2
import socket

print("🔍 PRUEBA DEFINITIVA CONNECTION POOLER")
print("=" * 60)

# Tu configuración (¡usa TU PASSWORD real!)
config = {
    'password': 'TU_PASSWORD_AQUI',  # ← CAMBIA ESTO
    'project_id': 'qqndelvjwltmjelduzlz'
}

# Opciones de conexión pooler
pooler_options = [
    # Formato estándar Supabase
    {
        'host': 'aws-0-us-east-1.pooler.supabase.com',
        'port': 6543,
        'desc': 'Pooler estándar US East'
    },
    # Formato con tu project_id
    {
        'host': f"db.{config['project_id']}.pooler.supabase.co",
        'port': 6543, 
        'desc': 'Pooler con tu project_id'
    },
    # Alternativa
    {
        'host': 'pooler.supabase.com',
        'port': 6543,
        'desc': 'Pooler genérico'
    }
]

# Primero probamos conectividad básica
print("\n1. 🌐 PROBANDO CONECTIVIDAD DE RED:")
for option in pooler_options:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((option['host'], option['port']))
        
        if result == 0:
            print(f"   ✅ {option['host']}:{option['port']} - PUERTO ABIERTO")
        else:
            print(f"   ❌ {option['host']}:{option['port']} - PUERTO CERRADO/BLOQUEADO")
            
        sock.close()
    except Exception as e:
        print(f"   ❌ {option['host']}:{option['port']} - Error: {e}")

# Ahora probar conexión PostgreSQL
print("\n2. 🗄️ PROBANDO CONEXIÓN POSTGRESQL:")
for option in pooler_options:
    print(f"\n📍 {option['desc']}")
    print(f"   Host: {option['host']}:{option['port']}")
    
    try:
        conn = psycopg2.connect(
            host=option['host'],
            port=option['port'],
            database='postgres',
            user='postgres',
            password=config['password'],
            connect_timeout=10,
            sslmode='require'  # IMPORTANTE: SSL requerido
        )
        
        print("   ✅ CONEXIÓN EXITOSA!")
        
        # Ejecutar consultas de prueba
        cursor = conn.cursor()
        
        # Versión de PostgreSQL
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print(f"   • PostgreSQL: {version.split(',')[0]}")
        
        # Verificar nuestras tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = [row[0] for row in cursor.fetchall()]
        print(f"   • Tablas encontradas: {', '.join(tables)}")
        
        # Contar regiones
        if 'regions' in tables:
            cursor.execute("SELECT COUNT(*) FROM regions;")
            count = cursor.fetchone()[0]
            print(f"   • Regiones en DB: {count}")
            
            if count == 0:
                print("   ⚠️  La tabla 'regions' está vacía")
                print("   💡 Insertando datos de ejemplo...")
                
                regions = [
                    ("Costa Pacífica", "tropical", "Zonas cálidas y húmedas"),
                    ("Zona Fría Bogotá", "cold", "Altitud >2600m, clima frío"),
                    ("Caribe", "tropical", "Región costera cálida"),
                    ("Eje Cafetero", "temperate", "Clima templado, zonas montañosas"),
                ]
                
                for name, climate, desc in regions:
                    cursor.execute(
                        "INSERT INTO regions (name, climate_type, description) VALUES (%s, %s, %s)",
                        (name, climate, desc)
                    )
                
                conn.commit()
                print("   ✅ 4 regiones insertadas")
        
        conn.close()
        
        print(f"\n🎉 ¡CONEXIÓN EXITOSA CON POOLER!")
        print(f"   Usa en tu .env:")
        print(f"   DATABASE_URL=postgresql://postgres:{config['password']}@{option['host']}:{option['port']}/postgres?sslmode=require")
        
        break  # Salir si una conexión funciona
        
    except psycopg2.OperationalError as e:
        print(f"   ❌ Error de conexión: {str(e)[:100]}")
    except Exception as e:
        print(f"   ❌ Error general: {str(e)[:100]}")

print("\n" + "=" * 60)
print("📌 SI TODAS FALLAN: Tu firewall bloquea el puerto 6543 también")
print("💡 SOLUCIÓN: Usar SQLite local + REST API temporalmente")