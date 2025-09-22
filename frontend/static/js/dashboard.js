// frontend/static/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    const slider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let currentIndex = 0;
    const slideCount = slides.length;

    function goToSlide(index) {
        if (index < 0) {
            index = slideCount - 1;
        } else if (index >= slideCount) {
            index = 0;
        }
        slider.style.transform = `translateX(-${index * 100}%)`;
        currentIndex = index;
    }

    prevBtn.addEventListener('click', () => {
        goToSlide(currentIndex - 1);
    });

    nextBtn.addEventListener('click', () => {
        goToSlide(currentIndex + 1);
    });

    // Mover automáticamente cada 5 segundos
    setInterval(() => {
        goToSlide(currentIndex + 1);
    }, 5000);
});