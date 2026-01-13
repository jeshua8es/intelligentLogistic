import os
import sys
import django
import psycopg2
from dotenv import load_dotenv
import urllib.parse

# ============================================
# CONFIGURACIÓN INICIAL
# ============================================
print("=" * 70)
print("🔍 VERIFICACIÓN COMPLETA DE CONEXIÓN SUPABASE + DJANGO")
print("=" * 70)

# Cargar variables de entorno
load_dotenv()

# 1. VERIFICAR VARIABLES DE ENTORNO
print("\n1. 📋 VARIABLES DE ENTORNO:")
print("-" * 40)

variables = [
    'DATABASE_URL',
    'SUPABASE_URL', 
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SECRET_KEY',
    'DEBUG',
    'ALLOWED_HOSTS'
]

all_vars_ok = True
for var_name in variables:
    value = os.getenv(var_name)
    
    if value:
        # Ocultar partes sensibles para seguridad
        if 'KEY' in var_name or 'SECRET' in var_name:
            if len(value) > 20:
                display_value = value[:20] + "..."
            else:
                display_value = value[:10] + "..."
        elif 'DATABASE_URL' in var_name:
            # Ocultar password en DATABASE_URL
            try:
                parsed = urllib.parse.urlparse(value)
                if parsed.password:
                    safe_url = value.replace(parsed.password, '••••••••')
                    display_value = safe_url[:70] + "..." if len(safe_url) > 70 else safe_url
                else:
                    display_value = value[:70] + "..." if len(value) > 70 else value
            except:
                display_value = value[:50] + "..."
        else:
            display_value = value[:50] + "..." if len(value) > 50 else value
            
        status = "✅"
        print(f"   {status} {var_name}: {display_value}")
    else:
        status = "❌"
        print(f"   {status} {var_name}: NO DEFINIDA")
        all_vars_ok = False

# 2. PROBAR CONEXIÓN DIRECTA A SUPABASE POSTGRESQL
print("\n2. 🗄️  CONEXIÓN DIRECTA A SUPABASE POSTGRESQL:")
print("-" * 40)

try:
    db_url = os.getenv('DATABASE_URL')
    
    if not db_url:
        print("   ❌ DATABASE_URL no definida")
        raise ValueError("DATABASE_URL faltante")
    
    # Parsear la URL de conexión
    parsed = urllib.parse.urlparse(db_url)
    
    print(f"   • Host: {parsed.hostname}")
    print(f"   • Puerto: {parsed.port}")
    print(f"   • Base de datos: {parsed.path[1:]}")
    print(f"   • Usuario: {parsed.username}")
    
    # Intentar conexión
    conn = psycopg2.connect(
        dbname=parsed.path[1:],
        user=parsed.username,
        password=parsed.password,
        host=parsed.hostname,
        port=parsed.port,
        connect_timeout=10
    )
    
    cursor = conn.cursor()
    
    # 2.1. Verificar versión de PostgreSQL
    cursor.execute("SELECT version();")
    db_version = cursor.fetchone()[0]
    print(f"   ✅ CONEXIÓN EXITOSA!")
    print(f"   • PostgreSQL: {db_version.split(',')[0]}")
    
    # 2.2. Verificar tablas existentes
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = [row[0] for row in cursor.fetchall()]
    print(f"   • Tablas encontradas: {', '.join(tables)}")
    
    # 2.3. Verificar datos en regions (deberían ser 4)
    cursor.execute("SELECT COUNT(*) FROM regions;")
    region_count = cursor.fetchone()[0]
    print(f"   • Regiones en DB: {region_count} filas")
    
    # 2.4. Mostrar las regiones
    cursor.execute("SELECT id, name, climate_type FROM regions ORDER BY name;")
    regions = cursor.fetchall()
    print(f"   • Detalle de regiones:")
    for region in regions:
        print(f"      - {region[1]} ({region[2]})")
    
    cursor.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    print(f"   ❌ ERROR DE CONEXIÓN: {str(e)}")
    print(f"   💡 Posibles soluciones:")
    print(f"     1. Verifica que el password en DATABASE_URL sea correcto")
    print(f"     2. Resetea el password en Supabase: Database Settings → Database password")
    print(f"     3. Agrega tu IP en Supabase: Database → Allowed IPs → 0.0.0.0/0")
except Exception as e:
    print(f"   ❌ ERROR INESPERADO: {str(e)}")

# 3. CONFIGURACIÓN DJANGO
print("\n3. 🐍 CONFIGURACIÓN Y CONEXIÓN DJANGO:")
print("-" * 40)

try:
    # Configurar Django
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings') 
    
    django.setup()
    
    from django.db import connection
    from django.conf import settings
    
    print(f"   ✅ DJANGO INICIALIZADO CORRECTAMENTE")
    print(f"   • DEBUG: {settings.DEBUG}")
    print(f"   • Time Zone: {settings.TIME_ZONE}")
    
    # Probar conexión Django a la base de datos
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1 as test_value, CURRENT_TIMESTAMP as server_time")
        result = cursor.fetchone()
        
        if result and result[0] == 1:
            print(f"   ✅ CONEXIÓN DJANGO-DB FUNCIONA")
            print(f"   • Hora del servidor: {result[1]}")
        else:
            print(f"   ❌ CONEXIÓN DJANGO-DB FALLÓ")
    
    # Verificar configuración de Supabase en settings
    if hasattr(settings, 'SUPABASE_CONFIG'):
        print(f"   ✅ CONFIGURACIÓN SUPABASE CARGADA")
    else:
        print(f"   ⚠️  Configuración SUPABASE no encontrada en settings")
    
except django.core.exceptions.ImproperlyConfigured as e:
    print(f"   ❌ ERROR CONFIGURACIÓN DJANGO: {str(e)}")
    print(f"   💡 Revisa tu archivo settings.py y .env")
except Exception as e:
    print(f"   ❌ ERROR DJANGO: {str(e)}")

# 4. RESUMEN FINAL
print("\n" + "=" * 70)
print("📊 RESUMEN FINAL")
print("=" * 70)

# Contar errores
errors = []
if not all_vars_ok:
    errors.append("Variables de entorno incompletas")

# Verificar conexión DB
try:
    db_url = os.getenv('DATABASE_URL')
    if db_url:
        parsed = urllib.parse.urlparse(db_url)
        conn = psycopg2.connect(
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password,
            host=parsed.hostname,
            port=parsed.port,
            connect_timeout=5
        )
        conn.close()
        print("✅ CONEXIÓN A BASE DE DATOS: EXITOSA")
    else:
        errors.append("DATABASE_URL no definida")
        print("❌ CONEXIÓN A BASE DE DATOS: FALLIDA")
except Exception as e:
    errors.append(f"Conexión DB: {str(e)}")
    print(f"❌ CONEXIÓN A BASE DE DATOS: FALLIDA - {str(e)}")

# Django
try:
    django.setup()
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    print("✅ CONEXIÓN DJANGO-DB: EXITOSA")
except Exception as e:
    errors.append(f"Django: {str(e)}")
    print(f"❌ CONEXIÓN DJANGO-DB: FALLIDA - {str(e)}")

# Resultado final
print("\n" + "=" * 70)
if not errors:
    print("🎉 ¡TODAS LAS CONEXIONES SON EXITOSAS!")
    print("   Puedes continuar con el siguiente paso.")
else:
    print(f"⚠️  SE ENCONTRARON {len(errors)} ERROR(ES):")
    for i, error in enumerate(errors, 1):
        print(f"   {i}. {error}")
    print("\n💡 Revisa las secciones anteriores para solucionarlos.")
print("=" * 70)

# 5. RECOMENDACIONES
print("\n📌 RECOMENDACIONES PARA CONTINUAR:")
print("-" * 40)

if not errors:
    print("1. ✅ Crea usuario de prueba en Supabase Auth")
    print("2. ✅ Prueba el endpoint: GET /api/inventory/regions/")
    print("3. 🚀 Inicia el servidor Django: python manage.py runserver")
    print("4. 🌐 Comienza con el frontend React")
else:
    print("1. 🔧 Corrige los errores mostrados arriba")
    print("2. 🔄 Vuelve a ejecutar este script: python test_connection.py")
    print("3. 📖 Revisa la configuración en .env y settings.py")

print("\n" + "=" * 70)