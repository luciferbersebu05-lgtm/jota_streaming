// Se importa el cliente de Supabase desde la URL de su CDN
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURACIÓN ---
const SUPABASE_URL = 'https://sprraxgaqivlayzrhqqz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcnJheGdhcWl2bGF5enJocXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzEyNzksImV4cCI6MjA3NDA0NzI3OX0.Gsi_h090KK_GPKOCDg_4S6nx6QyDHbEF7teg9IJhNlw';
const backendUrl = "https://jota-streaming-backend.onrender.com";

// --- INICIALIZACIÓN DE CLIENTES Y ELEMENTOS DEL DOM ---
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const accountsListDiv = document.getElementById('accounts-list');
const addAccountForm = document.getElementById('add-account-form');
const createUserForm = document.getElementById('create-user-form');
const loginForm = document.getElementById('login-form');
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
// --- Elementos del DOM para las nuevas secciones ---
const addAccountSection = document.getElementById('add-account-section');
const adminPanel = document.getElementById('admin-panel');
// El email de tu cuenta de administrador (puedes ponerlo en una variable para fácil acceso)
const ADMIN_EMAIL = "luciferbersebu05@gmail.com";

// --- LÓGICA DE LA APLICACIÓN ---

// 1. FUNCIÓN PARA OBTENER Y MOSTRAR LAS CUENTAS
async function fetchAndDisplayAccounts() {
    // ... (esta función se mantiene igual que la tenías)
    accountsListDiv.innerHTML = "<p>Cargando cuentas...</p>";
    try {
        const response = await fetch(backendUrl + "/api/accounts");
        const accounts = await response.json();
        accountsListDiv.innerHTML = "";
        if (accounts.length === 0) {
            accountsListDiv.innerHTML = "<p>No hay cuentas disponibles.</p>";
            return;
        }
        accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card';
            accountCard.innerHTML = `
                <h3>${account.service_name}</h3>
                <p>${account.description}</p>
                <p class="price"><b>Precio:</b> S/ ${account.price}</p>
                <button class="buy-btn" data-id="${account.id}">Comprar</button>
            `;
            accountsListDiv.appendChild(accountCard);
        });
    } catch (error) {
        console.error("Error al obtener las cuentas:", error);
        accountsListDiv.innerHTML = "<p>Hubo un error al cargar las cuentas.</p>";
    }
}

// 2. MANEJAR CLICS EN BOTONES DE COMPRA
accountsListDiv.addEventListener('click', async (event) => {
    // ... (esta función se mantiene igual que la tenías)
    if (event.target.classList.contains('buy-btn')) {
        const accountId = event.target.dataset.id;
        if (!confirm(`¿Estás seguro de comprar la cuenta ID ${accountId}?`)) return;
        try {
            const response = await fetch(`${backendUrl}/api/accounts/${accountId}/sell`, { method: 'PATCH' });
            if (!response.ok) throw new Error('La compra falló');
            alert('¡Cuenta comprada con éxito!');
            fetchAndDisplayAccounts();
        } catch (error) {
            console.error('Error al comprar la cuenta:', error);
            alert('Hubo un error durante la compra.');
        }
    }
});

// 3. MANEJAR FORMULARIO DE AÑADIR CUENTA (AHORA PROTEGIDO)
addAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert("Debes iniciar sesión para añadir una cuenta.");
            return;
        }

        const newAccountData = {
            service_name: document.getElementById('service_name').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value)
        };

        const response = await fetch(backendUrl + "/api/accounts", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(newAccountData),
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        alert('¡Cuenta añadida con éxito!');
        addAccountForm.reset();
        fetchAndDisplayAccounts();

    } catch (error) {
        console.error('Error al añadir la cuenta:', error);
        alert('Hubo un error al añadir la cuenta.');
    }
});

// 4. MANEJAR FORMULARIO DE CREAR USUARIO (ADMIN)
createUserForm.addEventListener('submit', async (event) => {
    // ... (esta función se mantiene igual que la tenías)
    event.preventDefault();
    const email = document.getElementById('user_email').value;
    const password = document.getElementById('user_password').value;
    try {
        const response = await fetch(backendUrl + "/api/admin/create-user", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Error al crear el usuario');
        alert(`¡Usuario ${result.user.email} creado con éxito!`);
        createUserForm.reset();
    } catch (error) {
        console.error('Error en el formulario de creación de usuario:', error);
        alert(error.message);
    }
});

// 5. LÓGICA DE AUTENTICACIÓN
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login_email').value;
    const password = document.getElementById('login_password').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Error al iniciar sesión: ' + error.message);
    } else {
        alert('¡Inicio de sesión exitoso!');
        loginForm.reset();
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