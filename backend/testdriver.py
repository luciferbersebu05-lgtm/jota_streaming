# backend/test_driver.py
try:
    import psycopg2
    print("✅ EXITO: El conector 'psycopg2' se importó correctamente.")
except ImportError as e:
    print(f"❌ ERROR: No se pudo importar 'psycopg2'. Error exacto: {e}")

import sys
print(f"🐍 Ruta del intérprete de Python que se está usando: {sys.executable}")