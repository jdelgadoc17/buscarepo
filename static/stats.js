// stats.js
// Funcionalidad de estadísticas de actividad de usuario GitHub

document.addEventListener('DOMContentLoaded', function() {
    const showStatsBtn = document.getElementById('showStatsBtn');
    const closeStatsModal = document.getElementById('closeStatsModal');
    const modal = document.getElementById('activityStatsModal');
    const statsContent = document.getElementById('activityStatsContent');

    if (showStatsBtn) {
        showStatsBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            const username = document.getElementById('username').value.trim();
            statsContent.innerHTML = '<span style="color:#1565c0;">Cargando estadísticas...</span>';

            // 1. Obtener eventos públicos para commits del último año
            fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
                .then(r => r.json())
                .then(events => {
                    // Procesar commits por mes del último año
                    const now = new Date();
                    const months = {};
                    for (let i = 0; i < 12; i++) {
                        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                        const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
                        months[key] = 0;
                    }
                    let commits = 0;
                    events.forEach(ev => {
                        if (ev.type === 'PushEvent') {
                            const date = new Date(ev.created_at);
                            const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}`;
                            if (months.hasOwnProperty(key)) {
                                months[key] += ev.payload.commits?.length || 0;
                                commits += ev.payload.commits?.length || 0;
                            }
                        }
                    });
                    const labels = Object.keys(months).sort();
                    const data = labels.map(k => months[k]);

                    // 2. Obtener lenguajes más usados en repos públicos
                    fetch(`https://api.github.com/users/${username}/repos?per_page=100`)
                        .then(r => r.json())
                        .then(repos => {
                            const langCount = {};
                            repos.forEach(repo => {
                                if (repo.language) {
                                    langCount[repo.language] = (langCount[repo.language] || 0) + 1;
                                }
                            });
                            const langLabels = Object.keys(langCount);
                            const langData = langLabels.map(l => langCount[l]);
                            const langColors = [
                                '#1976d2','#388e3c','#fbc02d','#d32f2f','#7b1fa2','#0288d1','#c2185b','#ffa000','#388e3c','#455a64'
                            ];

                            // Calcular porcentajes para el pie chart
                            const totalLangs = langData.reduce((a, b) => a + b, 0);
                            const langDataPercent = langData.map(v => totalLangs ? Math.round((v / totalLangs) * 100) : 0);
                            const langLabelsPercent = langLabels.map((l, i) => `${l} (${langDataPercent[i]}%)`);

                            // Renderizar ambos gráficos
                            statsContent.innerHTML = `
                                <div style='display:flex; flex-direction:row; gap:30px; justify-content:center; margin-bottom:20px;'>
                                    <div><b>Commits últimos 12 meses:</b> ${commits}</div>
                                </div>
                                <div style='display:flex; flex-wrap:wrap; gap:30px; justify-content:center;'>
                                    <div style='min-width:370px;'>
                                        <h4 style='text-align:center;'>Commits por mes (último año)</h4>
                                        <canvas id='commitsYearChart' width='350' height='180'></canvas>
                                    </div>
                                    <div style='min-width:320px;'>
                                        <h4 style='text-align:center;'>Lenguajes más usados</h4>
                                        <canvas id='langsPieChart' width='220' height='220'></canvas>
                                    </div>
                                </div>
                            `;
                            // Gráfico de barras de commits
                            const ctx1 = document.getElementById('commitsYearChart').getContext('2d');
                            new Chart(ctx1, {
                                type: 'bar',
                                data: {
                                    labels: labels,
                                    datasets: [{
                                        label: 'Commits por mes',
                                        data: data,
                                        backgroundColor: '#1976d2',
                                    }]
                                },
                                options: {
                                    responsive: false,
                                    plugins: { legend: { display: false } },
                                    scales: { x: { title: { display: true, text: 'Mes' } }, y: { title: { display: true, text: 'Commits' }, beginAtZero: true } }
                                }
                            });
                            // Gráfico de pastel de lenguajes con porcentaje
                            const ctx2 = document.getElementById('langsPieChart').getContext('2d');
                            new Chart(ctx2, {
                                type: 'pie',
                                data: {
                                    labels: langLabelsPercent,
                                    datasets: [{
                                        data: langData,
                                        backgroundColor: langColors,
                                    }]
                                },
                                options: {
                                    responsive: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }
                            });
                        });
                })
                .catch(() => {
                    statsContent.innerHTML = '<span style="color:#b71c1c;">Error al cargar estadísticas.</span>';
                });
        });
    }
    if (closeStatsModal) {
        closeStatsModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
});
