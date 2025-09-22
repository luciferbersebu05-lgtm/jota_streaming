// REEMPLAZA ESTA URL CON LA URL DE TU BACKEND EN RENDER
const backendUrl = "https://jota-streaming-backend.onrender.com";

const accountsListDiv = document.getElementById('accounts-list');
const addAccountForm = document.getElementById('add-account-form');

// --- 1. FUNCIÓN PARA OBTENER Y MOSTRAR LAS CUENTAS ---
async function fetchAndDisplayAccounts() {
    accountsListDiv.innerHTML = "<p>Cargando cuentas...</p>";
    try {
        const response = await fetch(backendUrl + "/api/accounts");
        
        // La variable 'accounts' se crea aquí y solo existe dentro de esta función 'try'
        const accounts = await response.json(); 

        accountsListDiv.innerHTML = ""; // Limpia el contenedor

        if (accounts.length === 0) {
            accountsListDiv.innerHTML = "<p>No hay cuentas disponibles en este momento.</p>";
            return;
        }

        // El bucle que usa 'accounts' está correctamente aquí dentro
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
        accountsListDiv.innerHTML = "<p>Hubo un error al cargar las cuentas. Intenta de nuevo.</p>";
    }
}

// --- 2. CÓDIGO PARA MANEJAR CLICS EN LOS BOTONES DE COMPRA ---
accountsListDiv.addEventListener('click', async (event) => {
    if (event.target.classList.contains('buy-btn')) {
        const accountId = event.target.dataset.id;
        
        if (!confirm(`¿Estás seguro de que quieres comprar la cuenta con ID ${accountId}?`)) {
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/api/accounts/${accountId}/sell`, {
                method: 'PATCH'
            });

            if (!response.ok) {
                throw new Error('La compra falló');
            }

            alert('¡Cuenta comprada con éxito!');
            fetchAndDisplayAccounts();

        } catch (error) {
            console.error('Error al comprar la cuenta:', error);
            alert('Hubo un error durante la compra.');
        }
    }
});

// --- 3. CÓDIGO PARA MANEJAR EL ENVÍO DEL FORMULARIO ---
addAccountForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newAccountData = {
        service_name: document.getElementById('service_name').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value)
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

        alert('¡Cuenta añadida con éxito!');
        addAccountForm.reset();
        fetchAndDisplayAccounts();

    } catch (error) {
        console.error('Error al añadir la cuenta:', error);
        alert('Hubo un error al añadir la cuenta.');
    }
});

// --- 4. LLAMADA INICIAL AL CARGAR LA PÁGINA ---
fetchAndDisplayAccounts();