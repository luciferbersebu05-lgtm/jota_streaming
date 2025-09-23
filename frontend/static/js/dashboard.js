// static/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA PARA EL SLIDER/CARRUSEL DE IMÁGENES SUPERIOR ---
    const slider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Salir si no se encuentran los elementos del slider en la página
    if (slider && slides.length > 0 && prevBtn && nextBtn) {
        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateSliderPosition() {
            slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSliderPosition();
        });

        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSliderPosition();
        });

        // Opcional: Slider automático
        setInterval(() => {
            nextBtn.click();
        }, 5000); // Cambia de imagen cada 5 segundos
    }


    // --- LÓGICA PARA MOSTRAR PRODUCTOS DINÁMICAMENTE ---
    const serviceCardsContainer = document.querySelector('.horizontal-scroll-container');
    const productDisplaySection = document.getElementById('product-display-section');
    const serviceProductTitle = document.getElementById('service-product-title');

    if (serviceCardsContainer && productDisplaySection && serviceProductTitle) {
        serviceCardsContainer.addEventListener('click', (event) => {
            // Buscamos si el clic fue en una tarjeta de servicio
            const clickedCard = event.target.closest('.service-card-horizontal');
            
            if (clickedCard) {
                event.preventDefault(); // Evita que el enlace '#' recargue la página

                const serviceName = clickedCard.dataset.service;

                // 1. Actualizamos el título de la sección
                serviceProductTitle.innerHTML = `Mostrando productos de: <span class="service-highlight">${serviceName}</span>`;
                
                // (Aquí en el futuro, harías una llamada a tu backend para traer los productos de 'serviceName')
                // Por ahora, solo mostramos la sección con las tarjetas de prueba.

                // 2. Hacemos visible la sección de productos
                productDisplaySection.style.display = 'block';

                // 3. Hacemos un scroll suave hasta la nueva sección
                productDisplaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});