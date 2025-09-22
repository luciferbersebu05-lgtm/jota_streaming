import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";

// --- INICIALIZACIÓN ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SELECCIÓN DE ELEMENTOS de index.html ---
const navLinks = document.getElementById('nav-links');
const toastContainer = document.getElementById('toast-container');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const closeButtons = document.querySelectorAll('.close-btn');

// --- VERIFICACIÓN DE SESIÓN AL CARGAR LA PÁGINA ---
// Si el usuario ya tiene sesión y está en index.html, lo manda al dashboard.
(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'dashboard.html';
    }
})();

// --- LÓGICA DE NOTIFICACIONES "TOAST" ---
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    if (toastContainer) {
        toastContainer.appendChild(toast);
        setTimeout(() => { toast.classList.add('show'); }, 100);
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    }
}

// --- LÓGICA PARA ABRIR Y CERRAR MODALES ---
const openLoginModal = () => loginModal.style.display = 'flex';
const openRegisterModal = () => registerModal.style.display = 'flex';
const closeModal = () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
};

closeButtons.forEach(button => button.addEventListener('click', closeModal));
// Asignamos eventos a los botones de la NAV que se crean al inicio
document.addEventListener('DOMContentLoaded', () => {
    navLinks.innerHTML = `
        <li><a href="#services">Mercado</a></li>
        <li><button id="login-btn-nav" class="nav-btn">Iniciar sesión</button></li>
        <li><button id="register-btn-nav" class="nav-btn-primary">Registrarse</button></li>
    `;
    document.getElementById('login-btn-nav').addEventListener('click', openLoginModal);
    document.getElementById('register-btn-nav').addEventListener('click', openRegisterModal);
});

// --- LÓGICA DE INICIO DE SESIÓN CON REDIRECCIÓN ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const identifier = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;
    let email = identifier;

    if (!identifier.includes('@')) {
        try {
            const response = await fetch(`${backendUrl}/api/get-email-by-username/${identifier}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Usuario no encontrado');
            email = data.email;
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
            return;
        }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        showToast('Error al iniciar sesión: Credenciales inválidas', 'error');
    } else {
        showToast('¡Inicio de sesión exitoso!');
        window.location.href = 'dashboard.html';
    }
});

// --- LÓGICA DE REGISTRO ---
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;

    if (password.length < 6) {
        showToast("La contraseña debe tener al menos 6 caracteres.", 'error');
        return;
    }
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) {
        showToast("Error al registrar: " + error.message, 'error');
    } else {
        closeModal();
        showToast("¡Registro exitoso! Tu cuenta está pendiente de aprobación.");
        registerForm.reset();
    }
});