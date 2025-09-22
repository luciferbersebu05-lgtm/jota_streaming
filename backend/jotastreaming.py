import os
import traceback
from dotenv import load_dotenv
from supabase import create_client, Client
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from functools import wraps

# Carga las variables de entorno del archivo .env
load_dotenv()

# Inicialización de la aplicación Flask
app = Flask(__name__)
CORS(app)

# --- CONFIGURACIÓN DE LA BASE DE DATOS PARA MIGRACIONES ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- CLIENTE DE SUPABASE ---
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)


# --- MODELO DE LA TABLA (Define la estructura de la tabla 'account') ---
class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    is_sold = db.Column(db.Boolean, default=False, nullable=False)
    # user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey('profiles.id'), nullable=True) # Futuro: para asociar cuentas a usuarios

    def __repr__(self):
        return f'<Account {self.service_name}>'

# --- DECORADOR PARA PROTEGER RUTAS (RESTAURADO) ---
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
        
        # Pasa el objeto 'user' a la función de la ruta
        return f(user_data.user, *args, **kwargs)
    return decorated_function

# --- ENDPOINTS DE LA API ---

@app.route("/")
def home():
    """ Ruta principal para verificar que el backend está funcionando. """
    return "¡El backend de Jota Streaming está funcionando!"

@app.route("/api/accounts", methods=['GET'])
def get_accounts():
    """ Obtiene la lista de todas las cuentas no vendidas. """
    try:
        response = supabase.table('account').select("*").eq('is_sold', False).execute()
        return jsonify(response.data)
    except Exception as e:
        print("!!!!!!!!!! ERROR AL OBTENER CUENTAS !!!!!!!!!!", flush=True)
        traceback.print_exc()
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route("/api/accounts", methods=['POST'])
@auth_required
def add_account(current_user):
    """ (Ruta Protegida) Añade una nueva cuenta. """
    try:
        print(f"Usuario {current_user.email} está añadiendo una cuenta.")
        data = request.get_json()
        if not data or not data.get('service_name') or not data.get('price'):
            return jsonify({"error": "Faltan datos requeridos"}), 400

        response = supabase.table('account').insert({
            'service_name': data.get('service_name'),
            'description': data.get('description'),
            'price': data.get('price'),
            'is_sold': False
            # 'user_id': current_user.id # Futuro: guarda quién creó la cuenta
        }).execute()
        
        return jsonify(response.data[0]), 201
    except Exception as e:
        print("!!!!!!!!!! ERROR AL AÑADIR CUENTA !!!!!!!!!!", flush=True)
        traceback.print_exc()
        return jsonify({"error": "Error interno del servidor"}), 500
        
@app.route("/api/accounts/<int:account_id>/sell", methods=['PATCH'])
@auth_required
def sell_account(current_user, account_id):
    """ (Ruta Protegida) Marca una cuenta como vendida. """
    try:
        print(f"Usuario {current_user.email} está comprando la cuenta {account_id}.")
        response = supabase.table('account').update({'is_sold': True}).eq('id', account_id).execute()
        if not response.data:
            return jsonify({"error": "Cuenta no encontrada"}), 404
        return jsonify(response.data[0])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/get-email-by-username/<string:username>", methods=['GET'])
def get_email_by_username(username):
    """ Busca el email de un usuario a partir de su nombre de usuario. """
    try:
        response = supabase.table('profiles').select('id').eq('username', username).limit(1).single().execute()
        if not response.data:
            return jsonify({"error": "El nombre de usuario no existe"}), 404

        user_id = response.data['id']
        user = supabase.auth.admin.get_user_by_id(user_id)
        
        return jsonify({"email": user.user.email})
    except Exception as e:
        print(f"Error buscando usuario: {e}", flush=True)
        return jsonify({"error": "Ocurrió un error en el servidor"}), 500

@app.route("/api/admin/create-user", methods=['POST'])
def admin_create_user():
    """ (Ruta de Admin) Crea un nuevo usuario sin enviar email de confirmación. """
    # NOTA: Esta ruta debería estar protegida para que solo el admin pueda usarla.
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