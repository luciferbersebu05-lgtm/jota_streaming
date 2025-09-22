import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";
const ADMIN_EMAIL = "luciferbersebu@gmail.com";

// --- INICIALIZACIÓN DE CLIENTES ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SELECCIÓN DE TODOS LOS ELEMENTOS DEL DOM ---
// Nota: Usamos '|| {}' para evitar errores si un elemento no está en la página actual.
const navLinks = document.getElementById('nav-links');
const mainContent = document.getElementById('main-content');
const dashboardContent = document.getElementById('dashboard-content');
const userEmailDashboard = document.getElementById('user-email-dashboard');
const adminPanel = document.getElementById('admin-panel');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeButtons = document.querySelectorAll('.close-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addAccountForm = document.getElementById('add-account-form');
const createUserForm = document.getElementById('create-user-form');
const logoClickableArea = document.getElementById('logo-clickable-area');
const serviceCards = document.querySelectorAll('.service-card');
const ctaButton = document.querySelector('.cta-button');
const accountsListDiv = document.getElementById('accounts-list');
const toastContainer = document.getElementById('toast-container');

// --- LÓGICA DE NOTIFICACIONES "TOAST" ---
function showToast(message, type = 'success') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.classList.add('show'); }, 100);
    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// --- LÓGICA PARA ABRIR Y CERRAR VENTANAS MODALES ---
const openLoginModal = () => { if (loginModal) loginModal.style.display = 'flex'; };
const openRegisterModal = () => { if (registerModal) registerModal.style.display = 'flex'; };
const closeModal = () => {
    if (loginModal) loginModal.style.display = 'none';
    if (registerModal) registerModal.style.display = 'none';
};

// Asignar eventos solo si los elementos existen en la página actual
if (logoClickableArea) logoClickableArea.addEventListener('click', openLoginModal);
if (ctaButton) ctaButton.addEventListener('click', openRegisterModal);
if (serviceCards) serviceCards.forEach(card => card.addEventListener('click', openLoginModal));
if (closeButtons) closeButtons.forEach(button => button.addEventListener('click', closeModal));

window.addEventListener('click', (event) => {
    if (event.target === loginModal || event.target === registerModal) closeModal();
});
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
});


// --- LÓGICA DE LA APLICACIÓN ---

// GESTIONAR ESTADO DE LA SESIÓN Y LA NAVEGACIÓN (VERSIÓN UNIFICADA)
supabase.auth.onAuthStateChange((_event, session) => {
    if (!navLinks) return;
    navLinks.innerHTML = ''; // Limpia la navegación actual

    if (session) {
        // --- VISTA PARA USUARIO CON SESIÓN INICIADA ---
        const userNavHTML = `
            <li><a href="dashboard.html" class="nav-btn-primary">Mi Panel</a></li>
            <li><button id="logout-btn-nav" class="nav-btn">Cerrar Sesión</button></li>
        `;
        navLinks.innerHTML = userNavHTML;

        document.getElementById('logout-btn-nav').addEventListener('click', async () => {
            await supabase.auth.signOut();
            showToast('Has cerrado sesión.');
            window.location.replace("index.html"); // Redirigir al inicio al cerrar sesión
        });
        
        // Lógica específica para el dashboard
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
            userEmailDashboard.textContent = session.user.email;
            if (session.user.email === ADMIN_EMAIL) {
                adminPanel.style.display = 'block';
            } else {
                adminPanel.style.display = 'none';
            }
        }
        // Ocultar contenido principal en index.html si el usuario ya inició sesión
        if(mainContent) mainContent.style.display = 'none';


    } else {
        // --- VISTA PARA VISITANTES ---
        const guestNavHTML = `
            <li><a href="index.html#services">Mercado</a></li>
            <li><button id="login-btn-nav" class="nav-btn">Iniciar sesión</button></li>
            <li><button id="register-btn-nav" class="nav-btn-primary">Registrarse</button></li>
        `;
        navLinks.innerHTML = guestNavHTML;

        document.getElementById('login-btn-nav').addEventListener('click', openLoginModal);
        document.getElementById('register-btn-nav').addEventListener('click', openRegisterModal);
        
        // Mostrar contenido principal y ocultar dashboard
        if (mainContent) mainContent.style.display = 'block';
        if (dashboardContent) dashboardContent.style.display = 'none';
    }
});

// MANEJAR INICIO DE SESIÓN
if (loginForm) {
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
            closeModal();
            showToast('¡Inicio de sesión exitoso!');
            window.location.href = 'dashboard.html'; // Redirige al dashboard
        }
    });
}


// MANEJAR REGISTRO DE USUARIO
if (registerForm) {
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
            showToast("¡Registro exitoso! Revisa tu email para confirmar la cuenta.");
            registerForm.reset();
        }
    });
}

// MANEJAR FORMULARIO DE AÑADIR CUENTA
if (addAccountForm) {
    addAccountForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                showToast("Debes iniciar sesión para añadir una cuenta.", 'error');
                return;
            }
            const newAccountData = {
                service_name: document.getElementById('service_name').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value)
            };
            const response = await fetch(`${backendUrl}/api/accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(newAccountData),
            });
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            showToast('¡Cuenta añadida con éxito!');
            addAccountForm.reset();
            fetchAndDisplayAccounts(); // Vuelve a cargar las cuentas
        } catch (error) {
            showToast('Hubo un error al añadir la cuenta.', 'error');
        }
    });
}


// MANEJAR FORMULARIO DE CREAR USUARIO (ADMIN)
if (createUserForm) {
    createUserForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('user_email').value;
        const password = document.getElementById('user_password').value;
        try {
            // Se necesita el token de un admin para autorizar esta acción en el backend
            const { data: { session } } = await supabase.auth.getSession();
             if (!session) throw new Error("Acceso no autorizado");

            const response = await fetch(`${backendUrl}/api/admin/create-user`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al crear el usuario');
            showToast(`¡Usuario ${result.user.email} creado con éxito!`);
            createUserForm.reset();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

// MANEJAR CLICS EN BOTONES DE COMPRA
if (accountsListDiv) {
    accountsListDiv.addEventListener('click', async (event) => {
        if (event.target.classList.contains('buy-btn')) {
            const accountId = event.target.dataset.id;
            if (!confirm(`¿Estás seguro de comprar la cuenta ID ${accountId}?`)) return;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    showToast("Debes iniciar sesión para comprar.", 'error');
                    return;
                }
                const response = await fetch(`${backendUrl}/api/accounts/${accountId}/sell`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });
                if (!response.ok) throw new Error('La compra falló');
                showToast('¡Cuenta comprada con éxito!');
                fetchAndDisplayAccounts(); // Vuelve a cargar la lista
            } catch (error) {
                showToast('Hubo un error durante la compra.', 'error');
            }
        }
    });
}

// --- FUNCIÓN PARA OBTENER Y MOSTRAR CUENTAS ---
async function fetchAndDisplayAccounts() {
    if (!accountsListDiv) return; // No hacer nada si el div no existe
    accountsListDiv.innerHTML = '<p>Cargando cuentas...</p>';
    
    try {
        const response = await fetch(`${backendUrl}/api/accounts/available`);
        if (!response.ok) throw new Error('No se pudieron cargar las cuentas.');
        
        const accounts = await response.json();
        
        if (accounts.length === 0) {
            accountsListDiv.innerHTML = '<p>No hay cuentas disponibles en este momento.</p>';
            return;
        }

        accountsListDiv.innerHTML = ''; // Limpiar el mensaje de "Cargando..."
        accounts.forEach(account => {
            const card = document.createElement('div');
            card.className = 'product-card-grid'; // Usamos la clase de dashboard.css
            
            card.innerHTML = `
                <div class="stock-indicator">Disponible</div>
                <img src="https://logo.clearbit.com/${account.service_name.toLowerCase()}.com" alt="${account.service_name}" onerror="this.src='static/img/logo.png';">
                <h3>${account.service_name}</h3>
                <p>${account.description}</p>
                <div class="price">S/ ${account.price.toFixed(2)}</div>
                <button class="buy-btn" data-id="${account.id}">Comprar Ahora</button>
            `;
            accountsListDiv.appendChild(card);
        });
    } catch (error) {
        accountsListDiv.innerHTML = `<p style="color: #e74c3c;">${error.message}</p>`;
    }
}

// --- LLAMADA INICIAL AL CARGAR LA PÁGINA ---
fetchAndDisplayAccounts();