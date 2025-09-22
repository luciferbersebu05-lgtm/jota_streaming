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


// --- 3. LLAMADA INICIAL AL CARGAR LA PÁGINA ---
// Llama a la función para mostrar las cuentas tan pronto como se carga la página.
fetchAndDisplayAccounts();