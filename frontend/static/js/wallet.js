// static/js/wallet.js

document.addEventListener('DOMContentLoaded', () => {
    const solesInput = document.getElementById('soles-input');
    const usdEquivalentDisplay = document.getElementById('usd-equivalent');
    const addBalanceTriggerBtn = document.getElementById('add-balance-trigger');
    const paymentMethodsSection = document.getElementById('payment-methods-section');

    // Función para calcular la conversión
    function calculateConversion() {
        const exchangeRate = 3.50; // 1 USD = 3.50 PEN
        const feePer10Soles = 0.20; // $0.20 de comisión por cada 10 soles

        const soles = parseFloat(solesInput.value) || 0;

        if (soles <= 0) {
            usdEquivalentDisplay.innerHTML = `Recibirás: <strong>$0.00 USD</strong>`;
            return;
        }

        // 1. Calcular la comisión
        const numberOf10SolesChunks = Math.floor(soles / 10);
        const totalFeeInUSD = numberOf10SolesChunks * feePer10Soles;

        // 2. Convertir soles a dólares
        const dollarsBeforeFee = soles / exchangeRate;

        // 3. Restar la comisión para obtener el monto final
        const finalUSDAmount = dollarsBeforeFee - totalFeeInUSD;

        // 4. Mostrar el resultado formateado a 2 decimales
        usdEquivalentDisplay.innerHTML = `Recibirás: <strong>$${finalUSDAmount.toFixed(2)} USD</strong>`;
    }

    // Escuchar cada vez que el usuario escribe en el campo de soles
    if (solesInput && usdEquivalentDisplay) {
        solesInput.addEventListener('input', calculateConversion);
    }

    // Escuchar el clic en el botón "Añadir Saldo"
    if (addBalanceTriggerBtn && paymentMethodsSection) {
        addBalanceTriggerBtn.addEventListener('click', () => {
            // Mostrar la sección de métodos de pago
            paymentMethodsSection.style.display = 'block';

            // Hacer scroll suave hacia la sección
            paymentMethodsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
});