// frontend/main.js

// REEMPLAZA ESTA URL CON LA URL DE TU BACKEND EN RENDER
const backendUrl = "https://jota-streaming-backend.onrender.com";

const responseDiv = document.getElementById('backend-response');

// Hacemos una petición a la ruta de prueba de nuestro backend
fetch(backendUrl + "/")
    .then(response => response.text())
    .then(data => {
        console.log("Respuesta del backend:", data);
        responseDiv.textContent = "Conexión con el backend exitosa: " + data;
        responseDiv.style.color = "green";
    })
    .catch(error => {
        console.error("Error al conectar con el backend:", error);
        responseDiv.textContent = "Error al conectar con el backend.";
        responseDiv.style.color = "red";
    });