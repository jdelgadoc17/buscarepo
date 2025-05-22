// main.js: JS principal para la app de repositorios GitHub

document.addEventListener('DOMContentLoaded', function() {
    // Envío automático del formulario al cambiar el filtro de orden
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            document.getElementById('searchForm').submit();
        });
    }

    // Hacer que los div.repo y h2 sean clicables para abrir el repo
    document.querySelectorAll('.repo').forEach(function(repoDiv) {
        var url = repoDiv.dataset.url;
        repoDiv.addEventListener('click', function() {
            if (url) window.open(url, '_blank');
        });
        var h2 = repoDiv.querySelector('h2');
        if (h2) {
            h2.addEventListener('click', function(e) {
                e.stopPropagation();
                if (url) window.open(url, '_blank');
            });
        }
    });

    // Modo claro/oscuro
    var toggleTheme = document.getElementById('toggleTheme');
    var body = document.body;
    // Cargar preferencia guardada
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
    }
    if (toggleTheme) {
        toggleTheme.addEventListener('click', function() {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }
});
