import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";
const ADMIN_EMAIL = "luciferbersebu@gmail.com";

// --- INICIALIZACIÓN DE CLIENTES ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SELECCIÓN DE TODOS LOS ELEMENTOS DEL DOM ---
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginBtnNav = document.getElementById('login-btn-nav');
const registerBtnNav = document.getElementById('register-btn-nav');
const closeButtons = document.querySelectorAll('.close-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const addAccountForm = document.getElementById('add-account-form');
const createUserForm = document.getElementById('create-user-form');
const logoClickableArea = document.getElementById('logo-clickable-area');
const serviceCards = document.querySelectorAll('.service-card');
const ctaButton = document.querySelector('.cta-button');
const userSection = document.getElementById('user-section');
const addAccountSection = document.getElementById('add-account-section');
const adminPanel = document.getElementById('admin-panel');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const accountsListDiv = document.getElementById('accounts-list');

// --- LÓGICA DE NOTIFICACIONES "TOAST" ---
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
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
    if (event.target === loginModal || event.target === registerModal) closeModal();
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
});

// --- LÓGICA DE LA APLICACIÓN ---

// 1. OBTENER Y MOSTRAR CUENTAS
async function fetchAndDisplayAccounts() {
    accountsListDiv.innerHTML = "<p>Cargando cuentas...</p>";
    try {
        const response = await fetch(`${backendUrl}/api/accounts`);
        if (!response.ok) throw new Error('Error al cargar datos');
        const accounts = await response.json();
        accountsListDiv.innerHTML = "";
        if (accounts.length === 0) {
            accountsListDiv.innerHTML = "<p>No hay cuentas disponibles.</p>";
            return;
        }
        accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            accountCard.innerHTML = `<h3>${account.service_name}</h3><p>${account.description}</p><p class="price"><b>Precio:</b> S/ ${account.price}</p><button class="buy-btn" data-id="${account.id}">Comprar</button>`;
            accountsListDiv.appendChild(accountCard);
        });
    } catch (error) {
        console.error("Error al obtener las cuentas:", error);
        accountsListDiv.innerHTML = "<p>Hubo un error al cargar las cuentas.</p>";
    }
}

// 2. MANEJAR REGISTRO DE USUARIO
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

// 3. MANEJAR INICIO DE SESIÓN
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
    }
});

// 4. MANEJAR CIERRE DE SESIÓN
logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    showToast('Has cerrado sesión.');
});

// 5. GESTIONAR ESTADO DE LA SESIÓN
supabase.auth.onAuthStateChange((_event, session) => {
    const mainContent = document.querySelector('main');
    if (session) {
        loginBtnNav.style.display = 'none';
        registerBtnNav.style.display = 'none';
        userSection.style.display = 'block';
        userEmailSpan.textContent = session.user.email;
        addAccountSection.style.display = 'block';
        mainContent.style.display = 'none'; // Oculta el hero y las tarjetas
        if (session.user.email === ADMIN_EMAIL) {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
    } else {
        loginBtnNav.style.display = 'block';
        registerBtnNav.style.display = 'block';
        userSection.style.display = 'none';
        userEmailSpan.textContent = '';
        addAccountSection.style.display = 'none';
        adminPanel.style.display = 'none';
        mainContent.style.display = 'block'; // Muestra el hero y las tarjetas
    }
});

// 6. MANEJAR FORMULARIO DE AÑADIR CUENTA
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
        console.error('Error al añadir la cuenta:', error);
        showToast('Hubo un error al añadir la cuenta.', 'error');
    }
});

// 7. MANEJAR FORMULARIO DE CREAR USUARIO (ADMIN)
createUserForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('user_email').value;
    const password = document.getElementById('user_password').value;
    try {
        const response = await fetch(`${backendUrl}/api/admin/create-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al crear el usuario');
        showToast(`¡Usuario ${result.user.email} creado con éxito!`);
        createUserForm.reset();
    } catch (error) {
        console.error('Error en el formulario de creación de usuario:', error);
        showToast(error.message, 'error');
    }
});

// 8. MANEJAR CLICS EN BOTONES DE COMPRA
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
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });
            if (!response.ok) throw new Error('La compra falló');
            showToast('¡Cuenta comprada con éxito!');
            fetchAndDisplayAccounts();
        } catch (error) {
            console.error('Error al comprar la cuenta:', error);
            showToast('Hubo un error durante la compra.', 'error');
        }
    }
});

// --- LLAMADA INICIAL AL CARGAR LA PÁGINA ---
fetchAndDisplayAccounts();