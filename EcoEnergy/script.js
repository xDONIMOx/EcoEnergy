document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main');

    if (menuToggle && sidebar) {
        // Abrir/Cerrar menú con el botón de hamburguesa
        menuToggle.addEventListener('click', (event) => {
            sidebar.classList.toggle('active');
            event.stopPropagation(); // Evita que el evento se propague al documento
        });

        // Opcional: Cerrar el menú si se hace clic fuera de él
        document.addEventListener('click', (event) => {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            if (sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnToggle) {
                sidebar.classList.remove('active');
            }
        });
    }

    // --- Tu código del acordeón (sin cambios) ---
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');

            if (button.classList.contains('active')) {
                // Usamos maxHeight para una transición suave con CSS
                content.style.display = 'block'; 
            } else {
                content.style.display = 'none';
            }
        });
    });
});