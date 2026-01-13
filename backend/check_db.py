# check_db.py - Verificar base de datos SQLite
import os
import sqlite3

print("🔍 VERIFICANDO BASE DE DATOS SQLITE")
print("=" * 50)

db_path = 'db.sqlite3'
print(f"Ruta de la BD: {os.path.abspath(db_path)}")
print(f"Existe: {os.path.exists(db_path)}")

if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Listar todas las tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        
        print(f"\n📊 TABLAS EN LA BASE DE DATOS ({len(tables)}):")
        for table in tables:
            table_name = table[0]
            # Contar filas en cada tabla
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"  • {table_name}: {count} filas")
        
        # Verificar tablas críticas de Django
        critical_tables = ['django_session', 'auth_user', 'django_content_type', 'auth_group']
        print(f"\n🔍 TABLAS CRÍTICAS DE DJANGO:")
        for table in critical_tables:
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            exists = cursor.fetchone()
            print(f"  • {table}: {'✅ EXISTE' if exists else '❌ FALTA'}")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Error SQLite: {e}")
else:
    print("❌ La base de datos no existe")
    print("💡 Ejecuta: python manage.py migrate")