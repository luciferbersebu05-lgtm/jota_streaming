import os
import traceback
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from functools import wraps

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- CLIENTE DE SUPABASE ---
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


# --- MODELO DE LA TABLA ---
class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    is_sold = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return f'<Account {self.service_name}>'

# --- DECORADOR PARA PROTEGER RUTAS ---
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Falta el token de autorización'}), 401

        token = auth_header.split(' ')[1]
        try:
            user_data = supabase.auth.get_user(jwt=token)
        except Exception as e:
            return jsonify({'error': 'Token inválido o expirado', 'details': str(e)}), 401
        
        return f(user_data.user, *args, **kwargs)
    return decorated_function

# --- ENDPOINTS DE LA API ---
@app.route("/")
def home():
    return "¡El backend de Jota Streaming está funcionando!"

@app.route("/api/accounts", methods=['GET', 'POST'])
def handle_accounts():
    if request.method == 'POST':
        # Esta ruta ahora requiere autenticación, pero el decorador no se puede aplicar aquí
        # directamente porque la función maneja dos métodos. La protección se debe
        # manejar dentro de la lógica del POST.
        
        # Primero, verificamos el token
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Falta el token de autorización'}), 401
        token = auth_header.split(' ')[1]
        try:
            user = supabase.auth.get_user(jwt=token)
            print(f"Usuario {user.user.email} está añadiendo una cuenta.")
        except Exception:
            return jsonify({'error': 'Token inválido o expirado'}), 401

        # Si el token es válido, continuamos con la lógica para añadir la cuenta
        try:
            data = request.get_json()
            if not data or not data.get('service_name') or not data.get('price'):
                return jsonify({"error": "Faltan datos requeridos"}), 400

            response = supabase.table('account').insert({
                'service_name': data.get('service_name'),
                'description': data.get('description'),
                'price': data.get('price'),
                'is_sold': False
            }).execute()
            
            return jsonify(response.data[0]), 201
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": "Error interno del servidor, revisar logs."}), 500

    else: # GET
        try:
            response = supabase.table('account').select("*").eq('is_sold', False).execute()
            return jsonify(response.data)
        except Exception as e:
            traceback.print_exc()
            return jsonify({"error": "Error interno del servidor, revisar logs."}), 500
        
@app.route("/api/accounts/<int:account_id>/sell", methods=['PATCH'])
def sell_account(account_id):
    # (Esta ruta podría protegerse también si solo usuarios logueados pueden comprar)
    try:
        response = supabase.table('account').update({'is_sold': True}).eq('id', account_id).execute()
        if not response.data:
            return jsonify({"error": "Cuenta no encontrada"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/admin/create-user", methods=['POST'])
def admin_create_user():
    # (Esta ruta debería protegerse para que solo TÚ puedas usarla)
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        user = supabase.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
        })
        
        return jsonify({"message": "Usuario creado exitosamente", "user": user.model_dump()}), 201
    except Exception as e:
        print(f"Error creando usuario: {e}", flush=True)
        return jsonify({"error": str(e)}), 500