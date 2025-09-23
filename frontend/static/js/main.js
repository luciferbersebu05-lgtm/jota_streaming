import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";
const ADMIN_EMAIL = "luciferbersebu@gmail.com";

// --- INICIALIZACIÓN DE CLIENTES ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- LÓGICA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- SELECCIÓN DE ELEMENTOS DEL DOM ---
    const navLinks = document.getElementById('nav-links');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeButtons = document.querySelectorAll('.close-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const addAccountForm = document.getElementById('add-account-form');
    const createUserForm = document.getElementById('create-user-form');
    const accountsListDiv = document.getElementById('accounts-list');
    const toastContainer = document.getElementById('toast-container');
    const userEmailDashboard = document.getElementById('user-email-dashboard');
    const adminPanel = document.getElementById('admin-panel');
    const mainContent = document.getElementById('main-content'); // Para la página principal
    
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

    // --- MANEJO DE SESIÓN Y REDIRECCIÓN ---
    supabase.auth.onAuthStateChange((_event, session) => {
        // ### LÓGICA DE REDIRECCIÓN ###
        // Si hay sesión y estamos en index.html o la raíz, redirige al dashboard.
        if (session && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
            window.location.replace('dashboard.html');
            return;
        }

        // Si NO hay sesión y estamos en dashboard.html, redirige al inicio.
        if (!session && window.location.pathname.endsWith('dashboard.html')) {
            window.location.replace('index.html');
            return;
        }
        
        // Actualizar la barra de navegación en cualquier página
        updateNav(session);
    });

    function updateNav(session) {
        if (!navLinks) return;
        navLinks.innerHTML = '';

        if (session) {
    // Navegación para usuario con sesión iniciada
    navLinks.innerHTML = `
        <div class="nav-icon-menu">
            <a href="#" class="nav-icon-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                <span>Mi billetera</span>
            </a>
            <a href="#" class="nav-icon-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                <span>Mis compras</span>
            </a>
            <a href="#" class="nav-icon-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                <span>Día</span>
            </a>
            <a href="#" class="nav-icon-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                <span>Menu</span>
            </a>
        </div>
        <li><button id="logout-btn-nav" class="nav-btn-primary">Cerrar Sesión</button></li>
    `;
    document.getElementById('logout-btn-nav').addEventListener('click', async () => {
        await supabase.auth.signOut();
        showToast('Has cerrado sesión.');
        // onAuthStateChange se encargará de redirigir
    });

            // Si estamos en el dashboard, muestra el email y el panel de admin si corresponde
            if (userEmailDashboard) userEmailDashboard.textContent = session.user.email;
            if (adminPanel) {
                adminPanel.style.display = (session.user.email === ADMIN_EMAIL) ? 'block' : 'none';
            }

        } else {
            // Navegación para visitantes
            navLinks.innerHTML = `
                <li><a href="index.html#services">Mercado</a></li>
                <li><button id="login-btn-nav" class="nav-btn">Iniciar sesión</button></li>
                <li><button id="register-btn-nav" class="nav-btn-primary">Registrarse</button></li>
            `;
            document.getElementById('login-btn-nav').addEventListener('click', () => openModal(loginModal));
            document.getElementById('register-btn-nav').addEventListener('click', () => openModal(registerModal));
        }
    }

    // --- LÓGICA PARA ABRIR Y CERRAR VENTANAS MODALES ---
    const openModal = (modal) => { if (modal) modal.style.display = 'flex'; };
    const closeModal = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
    };

    if (mainContent) { // Solo asigna estos listeners si estamos en index.html
        document.querySelector('.cta-button').addEventListener('click', () => openModal(registerModal));
        document.querySelectorAll('.service-card').forEach(card => card.addEventListener('click', () => openModal(loginModal)));
    }
    
    if (closeButtons) {
        closeButtons.forEach(button => button.addEventListener('click', closeModal));
    }
    window.addEventListener('click', (event) => {
        if (event.target === loginModal || event.target === registerModal) closeModal();
    });

    // --- MANEJO DE FORMULARIOS ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
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
                showToast('Error: Credenciales inválidas', 'error');
            } else {
                closeModal();
                showToast('¡Inicio de sesión exitoso!');
                // onAuthStateChange se encargará de redirigir
            }
        });
    }

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
                fetchAndDisplayAccounts();
            } catch (error) {
                showToast('Hubo un error al añadir la cuenta.', 'error');
            }
        });
    }

    if (createUserForm) {
        createUserForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('user_email').value;
            const password = document.getElementById('user_password').value;
            try {
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
    
    // --- OBTENER Y MOSTRAR CUENTAS (solo en el dashboard) ---
    async function fetchAndDisplayAccounts() {
        if (!accountsListDiv) return;
        accountsListDiv.innerHTML = '<p>Cargando cuentas...</p>';
        try {
            const response = await fetch(`${backendUrl}/api/accounts/available`);
            if (!response.ok) throw new Error('No se pudieron cargar las cuentas.');
            const accounts = await response.json();
            accountsListDiv.innerHTML = '';
            if (accounts.length === 0) {
                accountsListDiv.innerHTML = '<p>No hay cuentas disponibles.</p>';
                return;
            }
            accounts.forEach(account => {
                const card = document.createElement('div');
                card.className = 'product-card-grid';
                card.innerHTML = `
                    <div class="stock-indicator">Disponible</div>
                    <img src="https://logo.clearbit.com/${account.service_name.toLowerCase().replace(/\s+/g, '')}.com" alt="${account.service_name}" onerror="this.src='static/img/logo.png';">
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

    if (accountsListDiv) {
        fetchAndDisplayAccounts();
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
                    fetchAndDisplayAccounts();
                } catch (error) {
                    showToast('Hubo un error durante la compra.', 'error');
                }
            }
        });
    }
});