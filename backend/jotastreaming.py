# backend/jotastreaming.py
import os
import traceback # <-- Importante añadir esta línea al inicio del archivo
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy      # Importa SQLAlchemy
from flask_migrate import Migrate            # Importa Migrate

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE LA BASE DE DATOS PARA MIGRACIONES ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- CLIENTE DE SUPABASE (aún lo usaremos para consultar datos) ---
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


# --- MODELO DE LA TABLA (así se define la tabla en código) ---
class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    is_sold = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'<Account {self.service_name}>'

# --- ENDPOINTS DE LA API (esto no cambia) ---
@app.route("/")
def home():
    return "¡El backend de Jota Streaming está funcionando!"

@app.route("/api/accounts", methods=['GET', 'POST'])
def handle_accounts():
    if request.method == 'POST':
        try:
            data = request.get_json()
            if not data or not data.get('service_name') or not data.get('price'):
                return jsonify({"error": "Faltan datos requeridos"}), 400

            response = supabase.table('account').insert({
                'service_name': data.get('service_name'),
                'description': data.get('description'),
                'price': data.get('price')
            }).execute()
            
            return jsonify(response.data[0]), 201
        except Exception as e:
            # Líneas de depuración que SÍ aparecerán en los logs de Render
            print("!!!!!!!!!! ERROR AL PROCESAR POST !!!!!!!!!!", flush=True)
            print(f"Error: {e}", flush=True)
            traceback.print_exc() # Imprime el Traceback completo
            return jsonify({"error": "Error interno del servidor, revisar logs."}), 500

    else: # GET
        try:
            response = supabase.table('account').select("*").eq('is_sold', False).execute()
            return jsonify(response.data)
        except Exception as e:
            # Líneas de depuración para el GET por si acaso
            print("!!!!!!!!!! ERROR AL PROCESAR GET !!!!!!!!!!", flush=True)
            print(f"Error: {e}", flush=True)
            traceback.print_exc()
            return jsonify({"error": "Error interno del servidor, revisar logs."}), 500
        
@app.route("/api/accounts/<int:account_id>/sell", methods=['PATCH'])
def sell_account(account_id):
    try:
        # Actualiza la cuenta en la base de datos, cambiando is_sold a True
        response = supabase.table('account').update({
            'is_sold': True
        }).eq('id', account_id).execute()

        # Verifica si se actualizó algún registro
        if not response.data:
            return jsonify({"error": "Cuenta no encontrada"}), 404

        return jsonify(response.data[0])

    except Exception as e:
        return jsonify({"error": str(e)}), 500