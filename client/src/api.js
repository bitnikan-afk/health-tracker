// HTTP-клиент — инициализируем окно.HT сразу
(function() {
  window.HT = window.HT || {};
  const API = '/api/v1';

  window.HT.api = async function(path, options) {
    options = options || {};
    const token = localStorage.getItem('ht_token');
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(API + path, { ...options, headers });

    if (res.status === 401) {
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
      window.location.hash = '#login';
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Ошибка запроса');
    }

    return res.json();
  };

  window.HT.apiGet = (path) => window.HT.api(path);
  window.HT.apiPost = (path, body) => window.HT.api(path, { method: 'POST', body: JSON.stringify(body) });
  window.HT.apiPut = (path, body) => window.HT.api(path, { method: 'PUT', body: JSON.stringify(body) });
  window.HT.apiDelete = (path) => window.HT.api(path, { method: 'DELETE' });

  // Auth helpers
  window.HT.isLoggedIn = () => !!localStorage.getItem('ht_token');
  window.HT.getToken = () => localStorage.getItem('ht_token');
  window.HT.getUser = () => { try { return JSON.parse(localStorage.getItem('ht_user')); } catch { return null; } };

  window.HT.login = async (email, password) => {
    const data = await window.HT.apiPost('/auth/login', { email, password });
    localStorage.setItem('ht_token', data.accessToken);
    localStorage.setItem('ht_user', JSON.stringify(data.user));
    return data.user;
  };

  window.HT.logout = () => {
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
    window.location.hash = '#login';
  };
})();
