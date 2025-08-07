document.addEventListener('DOMContentLoaded', () => {
    // Código para el acordeón (si lo tienes en un script aparte)
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            if (button.classList.contains('active')) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });

    // Código para el botón de menú
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
});