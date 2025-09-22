// frontend/static/js/main.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const backendUrl = "https://jota-streaming-backend.onrender.com";

// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginBtnNav = document.getElementById('login-btn-nav');
const registerBtnNav = document.getElementById('register-btn-nav');
const closeButtons = document.querySelectorAll('.close-btn');

// CORRECCIÓN: El ID en tu HTML es "login-form", no "login_form".
const loginForm = document.getElementById('login-form'); 
const registerForm = document.getElementById('register-form');
const logoClickableArea = document.getElementById('logo-clickable-area');
const serviceCards = document.querySelectorAll('.service-card');
const ctaButton = document.querySelector('.cta-button');

// --- LÓGICA PARA ABRIR Y CERRAR VENTANAS MODALES ---
const openLoginModal = () => loginModal.style.display = 'flex';
const openRegisterModal = () => registerModal.style.display = 'flex';
const closeModal = () => {
    loginModal.style.display = 'none';
    registerModal.style.display = 'none';
};

loginBtnNav.addEventListener('click', openLoginModal);
registerBtnNav.addEventListener('click', openRegisterModal);
closeButtons.forEach(button => button.addEventListener('click', closeModal));
logoClickableArea.addEventListener('click', openLoginModal);
ctaButton.addEventListener('click', openLoginModal);
serviceCards.forEach(card => card.addEventListener('click', openLoginModal));

window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) {
        closeModal();
    }
});

// NUEVO: Cerrar modales con la tecla 'Escape'
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// --- LÓGICA DE REGISTRO CON NOMBRE DE USUARIO ---
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const password = document.getElementById('register_password').value;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username }
        }
    });

    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        closeModal();
        alert("¡Registro exitoso! Tu cuenta está pendiente de aprobación por un administrador.");
        registerForm.reset();
    }
});

// --- LÓGICA DE INICIO DE SESIÓN (MODIFICADA) ---
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    // No sabemos si es email o username, lo llamamos 'identifier'
    const identifier = document.getElementById('login_email').value; 
    const password = document.getElementById('login_password').value;
    
    let email = identifier; // Por defecto, asumimos que es un email

    // Si no es un email, le pedimos al backend que lo busque
    if (!identifier.includes('@')) {
        try {
            const response = await fetch(`${backendUrl}/api/get-email-by-username/${identifier}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Usuario no encontrado');
            }
            email = data.email; // Encontramos el email asociado al username
        } catch (error) {
            alert('Error: ' + error.message);
            return;
        }
    }

    // Ahora intentamos iniciar sesión con el email
    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
    } else {
        closeModal();
        alert('¡Inicio de sesión exitoso!');
    }
});

logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    alert('Has cerrado sesión.');
});

supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
        // El usuario ha iniciado sesión
        authSection.style.display = 'none';
        userSection.style.display = 'block';
        userEmailSpan.textContent = session.user.email;

        // Muestra la sección para añadir cuentas
        addAccountSection.style.display = 'block';

        // Muestra el panel de admin SÓLO si el email coincide
        if (session.user.email === ADMIN_EMAIL) {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }

    } else {
        // El usuario ha cerrado sesión o no está logueado
        authSection.style.display = 'block';
        userSection.style.display = 'none';
        userEmailSpan.textContent = '';

        // Oculta las secciones protegidas
        addAccountSection.style.display = 'none';
        adminPanel.style.display = 'none';
    }
});

// --- LLAMADA INICIAL AL CARGAR LA PÁGINA ---
fetchAndDisplayAccounts();