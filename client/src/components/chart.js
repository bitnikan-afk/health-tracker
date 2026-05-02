// Chart helpers
window.HT = window.HT || {};

window.HT.createChart = function(canvas, config) {
  if (!canvas || !window.Chart) return null;

  const isDark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#0f172a';

  const defaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 11 } } }
    },
    scales: {
      x: { ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 10 } }, grid: { color: isDark ? 'rgba(148,163,184,.1)' : 'rgba(0,0,0,.06)' } },
      y: { ticks: { color: isDark ? '#64748b' : '#94a3b8', font: { size: 10 } }, grid: { color: isDark ? 'rgba(148,163,184,.1)' : 'rgba(0,0,0,.06)' } }
    }
  };

  if (config.type === 'line') defaults.plugins.legend = { display: false };

  return new Chart(canvas, { ...config, options: { ...defaults, ...config.options } });
};

window.HT.createWeightChart = function(canvas, data) {
  return window.HT.createChart(canvas, {
    type: 'line',
    data: {
      labels: data.map(d => new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
      datasets: [{
        data: data.map(d => d.weight),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,.1)',
        fill: true,
        tension: .3,
        pointRadius: 3,
        pointBackgroundColor: '#3b82f6'
      }]
    }
  });
};
