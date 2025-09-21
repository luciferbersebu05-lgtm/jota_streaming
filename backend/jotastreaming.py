# backend/jotastreaming.py
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, jsonify # Importa Flask

# Carga las variables de entorno
load_dotenv()

# --- Conexión con Supabase (esto se mantiene igual) ---
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

# --- Creación de la aplicación web con Flask ---
app = Flask(__name__)

# Endpoint de prueba para ver que todo funciona
@app.route("/")
def home():
    return "¡El backend de Jota Streaming está funcionando!"

# Endpoint de ejemplo para obtener cuentas (¡lo crearás más adelante!)
@app.route("/api/cuentas")
def get_cuentas():
    # Aquí iría la lógica para consultar la base de datos
    # response = supabase.table('cuentas').select("*").execute()
    # return jsonify(response.data)
    return jsonify({"mensaje": "Endpoint de cuentas listo para ser construido"})