# backend/jotastreaming.py
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, jsonify
from flask_cors import CORS # 👈 1. IMPORTA LA LIBRERÍA

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

app = Flask(__name__)
CORS(app) # 👈 2. APLÍCALA A TU APP

@app.route("/")
def home():
    return "¡El backend de Jota Streaming está funcionando!"

@app.route("/api/cuentas")
def get_cuentas():
    return jsonify({"mensaje": "Endpoint de cuentas listo para ser construido"})