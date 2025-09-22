// REEMPLAZA ESTA URL CON LA URL DE TU BACKEND EN RENDER
const backendUrl = "https://jota-streaming-backend.onrender.com";

const accountsListDiv = document.getElementById('accounts-list');
const addAccountForm = document.getElementById('add-account-form');

// --- 1. FUNCIÓN PARA OBTENER Y MOSTRAR LAS CUENTAS ---
async function fetchAndDisplayAccounts() {
    accountsListDiv.innerHTML = "<p>Cargando cuentas...</p>";
    try {
        const response = await fetch(backendUrl + "/api/accounts");
        const accounts = await response.json();

        accountsListDiv.innerHTML = ""; // Limpia el contenedor

        if (accounts.length === 0) {
            accountsListDiv.innerHTML = "<p>No hay cuentas disponibles en este momento.</p>";
            return;
        }

        accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'account-card'; // Para darle estilo con CSS después
            
            accountCard.innerHTML = `
                <h3>${account.service_name}</h3>
                <p>${account.description}</p>
                <p class="price"><b>Precio:</b> S/ ${account.price}</p>
                <button>Comprar</button>
            `;
            
            accountsListDiv.appendChild(accountCard);
        });

    } catch (error) {
        console.error("Error al obtener las cuentas:", error);
        accountsListDiv.innerHTML = "<p>Hubo un error al cargar las cuentas. Intenta de nuevo.</p>";
    }
}

// --- 2. FUNCIÓN PARA MANEJAR EL ENVÍO DEL FORMULARIO ---
addAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const serviceName = document.getElementById('service_name').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    const newAccountData = {
        service_name: serviceName,
        description: description,
        price: parseFloat(price)
    };

    try {
        const response = await fetch(backendUrl + "/api/accounts", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAccountData),
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const createdAccount = await response.json();
        console.log('Cuenta creada:', createdAccount);
        alert('¡Cuenta añadida con éxito!');
        
        addAccountForm.reset(); // Limpia el formulario
        fetchAndDisplayAccounts(); // Recarga la lista de cuentas

    } catch (error) {
        console.error('Error al añadir la cuenta:', error);
        alert('Hubo un error al añadir la cuenta.');
    }
});

// --- 1. FUNCIÓN PARA OBTENER Y MOSTRAR LAS CUENTAS (CON AJUSTES) ---
async function fetchAndDisplayAccounts() {
    // ... (código de fetch y manejo de errores sin cambios) ...

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
}


// --- 2. CÓDIGO NUEVO PARA MANEJAR CLICS EN LOS BOTONES DE COMPRA ---
accountsListDiv.addEventListener('click', async (event) => {
    // Solo reacciona si se hizo clic en un elemento con la clase 'buy-btn'
    if (event.target.classList.contains('buy-btn')) {
        const accountId = event.target.dataset.id;
        
        // Muestra una confirmación simple
        if (!confirm(`¿Estás seguro de que quieres comprar la cuenta con ID ${accountId}?`)) {
            return; // Si el usuario cancela, no hace nada
        }

        try {
            const response = await fetch(`${backendUrl}/api/accounts/${accountId}/sell`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('La compra falló');
            }

            alert('¡Cuenta comprada con éxito!');
            fetchAndDisplayAccounts(); // Recarga la lista para que la cuenta comprada desaparezca

        } catch (error) {
            console.error('Error al comprar la cuenta:', error);
            alert('Hubo un error durante la compra.');
        }
    }
});

// --- 3. LLAMADA INICIAL AL CARGAR LA PÁGINA ---
// Llama a la función para mostrar las cuentas tan pronto como se carga la página.
fetchAndDisplayAccounts();