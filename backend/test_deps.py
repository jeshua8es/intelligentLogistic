
print("🔍 VERIFICANDO DEPENDENCIAS JWT")
print("=" * 40)

try:
    import jwt
    print(f"✅ pyjwt instalado: versión {jwt.__version__}")
    print("   • Sirve para verificar tokens JWT de Supabase")
except ImportError:
    print("❌ pyjwt NO instalado")
    print("   💡 Ejecuta: pip install pyjwt")

try:
    import requests
    print(f"✅ requests instalado: versión {requests.__version__}")
    print("   • Sirve para hacer peticiones a la API de Supabase")
except ImportError:
    print("❌ requests NO instalado")
    print("   💡 Ejecuta: pip install requests")

print("\n🎯 Con estas librerías podremos:")
print("1. Recibir token JWT del frontend")
print("2. Verificar que Supabase lo firmó")
print("3. Extraer datos del usuario (email, id, role)")