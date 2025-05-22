// main.js: Maneja el envío automático del formulario al cambiar el filtro de orden

document.addEventListener('DOMContentLoaded', function() {
    var sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            document.getElementById('searchForm').submit();
        });
    }
});
