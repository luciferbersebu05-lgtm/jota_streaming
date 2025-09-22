import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";
const ADMIN_EMAIL = "luciferbersebu@gmail.com";

// --- INICIALIZACIÓN ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SELECCIÓN DE ELEMENTOS del dashboard.html ---
const navLinks = document.getElementById('nav-links');
const userEmailDashboard = document.getElementById('user-email-dashboard');
const adminPanel = document.getElementById('admin-panel');
const addAccountForm = document.getElementById('add-account-form');
const accountsListDiv = document.getElementById('accounts-list');
const toastContainer = document.getElementById('toast-container');
// ... y cualquier otro elemento específico del dashboard

// --- LÓGICA DE NOTIFICACIONES "TOAST" (igual que en main.js) ---
function showToast(message, type = 'success') {
    // ... (la misma función showToast que ya tienes)
}

// --- LÓGICA DEL SLIDER ---
const slider = document.querySelector('.hero-slider');
if (slider) {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let currentIndex = 0;
    const slideCount = slides.length;
    
    function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
    setInterval(() => goToSlide(currentIndex + 1), 5000);
}

// --- LÓGICA DEL DASHBOARD ---

// GESTIONAR LA BARRA DE NAVEGACIÓN Y MOSTRAR DATOS
supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
        navLinks.innerHTML = `
            <li><a href="dashboard.html" class="nav-btn-primary">Mi Panel</a></li>
            <li><button id="logout-btn-nav" class="nav-btn">Cerrar Sesión</button></li>
        `;
        document.getElementById('logout-btn-nav').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.replace("index.html");
        });
        
        if (userEmailDashboard) userEmailDashboard.textContent = session.user.email;
        if (adminPanel) {
            adminPanel.style.display = (session.user.email === ADMIN_EMAIL) ? 'block' : 'none';
        }

        // Una vez confirmada la sesión, carga las cuentas
        fetchAndDisplayAccounts();

    } else {
        // Si no hay sesión, onAuthStateChange se activa igual, lo mandamos a index
        window.location.replace("index.html");
    }
});

// OBTENER Y MOSTRAR CUENTAS
async function fetchAndDisplayAccounts() {
    // ... (la misma función que ya tenías)
}

// MANEJAR FORMULARIO DE AÑADIR CUENTA
addAccountForm.addEventListener('submit', async (event) => {
    // ... (la misma lógica que ya tenías)
});

// MANEJAR CLICS EN BOTONES DE COMPRA
accountsListDiv.addEventListener('click', async (event) => {
    // ... (la misma lógica que ya tenías)
});

// --- NO INCLUIMOS LÓGICA DE LOGIN/REGISTRO AQUÍ ---