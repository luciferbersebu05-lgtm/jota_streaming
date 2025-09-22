// static/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Salir si no se encuentran los elementos del slider en la página
    if (!slider || !slides || !prevBtn || !nextBtn || slides.length === 0) {
        return;
    }

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
});