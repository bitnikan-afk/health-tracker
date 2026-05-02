// Format utilities
window.HT = window.HT || {};

window.HT.todayStr = function() {
  return new Date().toISOString().slice(0, 10);
};

window.HT.nowISO = function() {
  return new Date().toISOString();
};

window.HT.formatDate = function(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

window.HT.formatTime = function(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

window.HT.formatDateFull = function(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

window.HT.formatKcal = function(v) {
  return Math.round(v);
};

window.HT.formatNum = function(v) {
  return Math.round(v * 10) / 10;
};

window.HT.ago = function(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return mins + 'м назад';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'ч назад';
  const days = Math.floor(hrs / 24);
  return days + 'д назад';
};
