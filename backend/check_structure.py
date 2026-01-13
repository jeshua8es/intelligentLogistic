# check_structure.py
import os
from pathlib import Path

print("📁 VERIFICANDO ESTRUCTURA DEL PROYECTO")
print("=" * 60)

BASE_DIR = Path(__file__).resolve().parent

print(f"Directorio base: {BASE_DIR}")
print()

# Verificar estructura
items = list(BASE_DIR.iterdir())
print("Contenido de la raíz:")
for item in items:
    if item.is_dir():
        print(f"  📁 {item.name}/")
        # Verificar si tiene __init__.py
        init_file = item / "__init__.py"
        if init_file.exists():
            print(f"     ✅ Tiene __init__.py")
        else:
            print(f"     ❌ Sin __init__.py")
    else:
        print(f"  📄 {item.name}")

print()
print("ESTADO DE shared/:")
shared_path = BASE_DIR / "shared"
if shared_path.exists():
    print(f"  ✅ shared/ existe")
    
    # Contenido de shared
    print(f"  Contenido de shared/:")
    for item in shared_path.iterdir():
        mark = "📁" if item.is_dir() else "📄"
        print(f"    {mark} {item.name}")
    
    # Verificar __init__.py en shared
    init_in_shared = shared_path / "__init__.py"
    if init_in_shared.exists():
        print(f"  ✅ shared/__init__.py EXISTE")
    else:
        print(f"  ❌ shared/__init__.py NO EXISTE")
        print(f"  🛠️  Creando shared/__init__.py...")
        init_in_shared.touch()
        print(f"  ✅ shared/__init__.py creado")
else:
    print(f"  ❌ shared/ NO existe")