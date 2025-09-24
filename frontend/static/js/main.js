// static/js/main.js

import { supabase } from './supabaseClient.js';

// --- LÓGICA DEL TEMA (MODO CLARO/OSCURO) ---

// Función para aplicar el tema
function applyTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    // Actualizamos el botón en la NAV, si ya existe
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        const span = themeToggleBtn.querySelector('span');
        span.textContent = theme === 'light' ? 'Noche' : 'Día';
    }
}

// Función para cambiar el tema
function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
}

// Aplicamos el tema guardado tan pronto como carga la página
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);


// --- LÓGICA DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {

    // ==================================================================
    // === FUNCIÓN DETECTOR DE BUCLE DE RECARGA (CORTOCIRCUITO) ===
    // ==================================================================
    async function checkReloadLoop() {
        const RELOAD_LIMIT = 15;
        const TIME_LIMIT_MS = 5000;
        try {
            const now = new Date().getTime();
            let reloadCount = parseInt(sessionStorage.getItem('reloadCount') || '0', 10);
            const lastReload = parseInt(sessionStorage.getItem('lastReloadTime') || '0', 10);
            if (now - lastReload > TIME_LIMIT_MS) {
                reloadCount = 0;
            }
            reloadCount++;
            sessionStorage.setItem('reloadCount', reloadCount.toString());
            sessionStorage.setItem('lastReloadTime', now.toString());
            if (reloadCount > RELOAD_LIMIT) {
                console.error("Bucle de recarga detectado. Cerrando sesión para proteger al usuario.");
                sessionStorage.clear();
                await supabase.auth.signOut();
                window.location.replace('/index.html');
                return true;
            }
        } catch (error) {
            console.error("Error en el detector de bucles:", error);
        }
        return false;
    }

    
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
    const mainContent = document.getElementById('main-content');
    
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

    // --- LÓGICA DEL MENÚ DESPLEGABLE DE USUARIO ---
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const userMenu = document.getElementById('user-menu-dropdown');

    if (menuToggleBtn && userMenu) {
        menuToggleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation(); // Evita que el clic se propague al 'window'

            // Calcula la posición del botón para alinear el menú
            const rect = menuToggleBtn.getBoundingClientRect();
            userMenu.style.top = `${rect.bottom + 10}px`; // 10px por debajo del botón
            
            // Alineamos el menú a la derecha del botón
            // window.innerWidth - rect.right alinea el borde derecho del menú con el del botón
            userMenu.style.right = `${window.innerWidth - rect.right}px`;
            // Reseteamos 'left' por si acaso
            userMenu.style.left = 'auto';

            // Muestra u oculta el menú
            userMenu.classList.toggle('show');
        });

        // Cierra el menú si se hace clic en cualquier otro lugar de la página
        window.addEventListener('click', (event) => {
            if (userMenu.classList.contains('show') && !userMenu.contains(event.target) && event.target !== menuToggleBtn) {
                userMenu.classList.remove('show');
            }
        });

        // Asignar función de logout al nuevo botón del menú
        const logoutBtnMenu = document.getElementById('logout-btn-menu');
        if(logoutBtnMenu) {
            logoutBtnMenu.addEventListener('click', async (event) => {
                event.preventDefault();
                 try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    showToast('Has cerrado sesión.');
                    window.location.replace('index.html');
                } catch (error) {
                    showToast('Error al cerrar sesión: ' + error.message, 'error');
                }
            });
        }
    }
    
    // --- MANEJO DE SESIÓN Y REDIRECCIÓN ---
    async function handleInitialAuth() {
        const loopDetected = await checkReloadLoop();
        if (loopDetected) {
            return;
        }
        const currentPage = window.location.pathname;
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && (currentPage.endsWith('index.html') || currentPage === '/')) {
            window.location.replace('dashboard.html');
            return;
        }
        
        if (!session && (currentPage.endsWith('dashboard.html') || currentPage.endsWith('wallet.html'))) {
            window.location.replace('index.html');
            return;
        }
        updateNav(session);
    }
    
    handleInitialAuth();

    supabase.auth.onAuthStateChange((_event, session) => {
        updateNav(session);
        if (!session && (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('wallet.html'))) {
            window.location.replace('index.html');
        }
    });

    // FUNCIÓN PARA ACTUALIZAR LA BARRA DE NAVEGACIÓN
    function updateNav(session) {
        if (!navLinks) return;
        navLinks.innerHTML = '';
        const currentTheme = localStorage.getItem('theme') || 'dark'; // Obtenemos el tema actual
        const ADMIN_EMAIL = "luciferbersebu@gmail.com"; // Definido para acceso

        if (session) {
            navLinks.innerHTML = `
                <div class="nav-icon-menu">
                    <a href="wallet.html" class="nav-icon-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                        <span>Mi billetera</span>
                    </a>
                    <a href="#" class="nav-icon-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        <span>Mis compras</span>
                    </a>
                    <a href="#" id="theme-toggle-btn" class="nav-icon-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                        <span>${currentTheme === 'light' ? 'Noche' : 'Día'}</span>
                    </a>
                    <a href="#" id="menu-toggle-btn" class="nav-icon-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        <span>Menu</span>
                    </a>
                </div>
                <li><button id="logout-btn-nav" class="nav-btn-primary">Cerrar Sesión</button></li>
            `;
            if (userEmailDashboard) userEmailDashboard.textContent = session.user.email;
            if (adminPanel) {
                adminPanel.style.display = (session.user.email === ADMIN_EMAIL) ? 'block' : 'none';
            }

        } else {
            navLinks.innerHTML = `
                <li><a href="index.html#services">Mercado</a></li>
                <li><button id="login-btn-nav" class="nav-btn">Iniciar sesión</button></li>
                <li><button id="register-btn-nav" class="nav-btn-primary">Registrarse</button></li>
            `;
        }
    }

    // MANEJADOR DE CLICS PARA LA BARRA DE NAVEGACIÓN
    if (navLinks) {
        navLinks.addEventListener('click', async (event) => {
            const target = event.target.closest('a, button');
            if (!target) return;
            
            // Lógica para el botón de tema
            if (target.id === 'theme-toggle-btn') {
                event.preventDefault();
                toggleTheme();
            }

            // Lógica para cerrar sesión
            if (target.id === 'logout-btn-nav') {
                try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    showToast('Has cerrado sesión.');
                    window.location.replace('index.html');
                } catch (error) {
                    showToast('Error al cerrar sesión: ' + error.message, 'error');
                }
            }

            // Lógica para login y register
            if (target.id === 'login-btn-nav') {
                openModal(loginModal);
            }
            if (target.id === 'register-btn-nav') {
                openModal(registerModal);
            }
        });
    }

    // --- LÓGICA PARA ABRIR Y CERRAR VENTANAS MODALES ---
    const openModal = (modal) => { if (modal) modal.style.display = 'flex'; };
    const closeModal = () => {
        if (loginModal) loginModal.style.display = 'none';
        if (registerModal) registerModal.style.display = 'none';
    };

    if (mainContent) {
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) ctaButton.addEventListener('click', () => openModal(registerModal));

        const serviceCards = document.querySelectorAll('.service-card');
        if(serviceCards) serviceCards.forEach(card => card.addEventListener('click', () => openModal(loginModal)));
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
                    const response = await fetch(`https://jota-streaming-backend.onrender.com/api/get-email-by-username/${identifier}`);
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
                window.location.replace('dashboard.html');
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
                const response = await fetch(`https://jota-streaming-backend.onrender.com/api/accounts`, {
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
    
                const response = await fetch(`https://jota-streaming-backend.onrender.com/api/admin/create-user`, {
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
            const response = await fetch(`https://jota-streaming-backend.onrender.com/api/accounts/available`);
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
                    const response = await fetch(`https://jota-streaming-backend.onrender.com/api/accounts/${accountId}/sell`, {
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