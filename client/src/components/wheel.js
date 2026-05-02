// Wheel of health — Canvas polygon
window.HT = window.HT || {};

window.HT.renderWheel = function(canvas, healthData) {
  if (!canvas) return;

  const rect = canvas.parentElement.getBoundingClientRect();
  const size = Math.min(rect.width, 300);
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  // Ranges and current values
  const metrics = [
    { label: 'Энергия', key: 'energy', min: 1, max: 5 },
    { label: 'Сон', key: 'sleepQuality', min: 1, max: 5 },
    { label: 'Стресс', key: 'stress', min: 5, max: 1 }, // inverted
    { label: 'Вес', key: 'weight', min: 60, max: 100 },
    { label: 'Пульс', key: 'pulse', min: 90, max: 55 }, // lower is better
  ];

  ctx.clearRect(0, 0, size, size);

  // Background rings
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * i / 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148,163,184,.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (!healthData) return;

  // Normalize values
  const values = metrics.map(m => {
    const raw = healthData[m.key];
    if (raw == null) return 0;
    let val;
    if (m.min < m.max) {
      val = (raw - m.min) / (m.max - m.min);
    } else {
      val = (m.min - raw) / (m.min - m.max);
    }
    return Math.max(0, Math.min(1, val));
  });

  // Fill polygon
  ctx.beginPath();
  for (let i = 0; i < metrics.length; i++) {
    const angle = (Math.PI * 2 / metrics.length) * i - Math.PI / 2;
    const dist = r * values[i];
    const x = cx + dist * Math.cos(angle);
    const y = cy + dist * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(59,130,246,.15)';
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Labels
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < metrics.length; i++) {
    const angle = (Math.PI * 2 / metrics.length) * i - Math.PI / 2;
    const lx = cx + (r + 14) * Math.cos(angle);
    const ly = cy + (r + 14) * Math.sin(angle);
    ctx.fillStyle = '#94a3b8';
    ctx.font = (size < 200) ? '9px sans-serif' : '10px sans-serif';
    ctx.fillText(metrics[i].label, lx, ly);
  }
};
