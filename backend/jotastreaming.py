# backend/jotastreaming.py
import os
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

@app.route("/api/accounts", methods=['POST'])
def add_account():
    try:
        # 1. Obtiene los datos enviados desde el frontend
        data = request.get_json()

        # 2. Valida que los datos necesarios están presentes (puedes añadir más validaciones)
        if not data or not data.get('service_name') or not data.get('price'):
            return jsonify({"error": "Faltan datos requeridos (service_name, price)"}), 400

        # 3. Inserta la nueva cuenta en la tabla 'account'
        response = supabase.table('account').insert({
            'service_name': data.get('service_name'),
            'description': data.get('description'),
            'price': data.get('price')
        }).execute()

        # 4. Devuelve el registro recién creado
        return jsonify(response.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500