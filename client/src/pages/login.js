// Login page
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  window.HT.pages.login = function() {
    if (window.HT.isLoggedIn()) {
      window.location.hash = '#dashboard';
      return '';
    }
    return `
      <div style="max-width:400px;margin:40px auto;padding:0 16px">
        <div style="text-align:center;margin-bottom:32px">
          <div style="font-size:48px;margin-bottom:8px">💪</div>
          <h1 style="font-size:22px;font-weight:700">Health Tracker</h1>
          <p style="color:var(--text2);font-size:14px;margin-top:4px">Дневник питания и здоровья</p>
        </div>
        <div id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input class="form-input" type="email" id="loginEmail" placeholder="your@email.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input class="form-input" type="password" id="loginPassword" placeholder="••••••" autocomplete="current-password">
          </div>
          <button class="btn btn-primary" id="loginBtn">Войти</button>
          <p style="text-align:center;margin-top:16px;font-size:13px;color:var(--text2)">
            Нет аккаунта? <a href="#" id="showRegister">Зарегистрироваться</a>
          </p>
        </div>
        <div id="registerForm" style="display:none">
          <div class="form-group">
            <label>Email</label>
            <input class="form-input" type="email" id="regEmail" placeholder="your@email.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input class="form-input" type="password" id="regPassword" placeholder="••••••" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label>Имя</label>
            <input class="form-input" id="regName" placeholder="Андрей" value="Андрей">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Дата рождения</label>
              <input class="form-input" type="date" id="regBirth" value="1985-01-01">
            </div>
            <div class="form-group">
              <label>Рост (см)</label>
              <input class="form-input" type="number" id="regHeight" value="175">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Вес (кг)</label>
              <input class="form-input" type="number" id="regWeight" value="89" step="0.1">
            </div>
            <div class="form-group">
              <label>Целевой вес</label>
              <input class="form-input" type="number" id="regTarget" value="82" step="0.1">
            </div>
          </div>
          <div class="form-group">
            <label>Активность</label>
            <select class="form-select" id="regActivity">
              <option value="sedentary" selected>Сидячая (офис)</option>
              <option value="light">Лёгкая (прогулки)</option>
              <option value="moderate">Умеренная (спорт 3-4р/нед)</option>
              <option value="active">Высокая (спорт 5+р/нед)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Цель</label>
            <select class="form-select" id="regGoal">
              <option value="lose_weight" selected>Снижение веса</option>
              <option value="maintain">Поддержание</option>
            </select>
          </div>
          <button class="btn btn-primary" id="registerBtn">Создать аккаунт</button>
          <p style="text-align:center;margin-top:16px;font-size:13px;color:var(--text2)">
            Уже есть аккаунт? <a href="#" id="showLogin">Войти</a>
          </p>
        </div>
      </div>
    `;
  };

  window.HT.initFns.login = function() {
    document.getElementById('showRegister')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('loginForm').style.display = 'none';
      document.getElementById('registerForm').style.display = 'block';
    });

    document.getElementById('showLogin')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('registerForm').style.display = 'none';
      document.getElementById('loginForm').style.display = 'block';
    });

    document.getElementById('loginBtn')?.addEventListener('click', async () => {
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      try {
        await window.HT.login(email, password);
        window.HT.showToast('Успешный вход!');
        window.location.hash = '#dashboard';
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });

    document.getElementById('registerBtn')?.addEventListener('click', async () => {
      const fields = {
        email: document.getElementById('regEmail').value.trim(),
        password: document.getElementById('regPassword').value,
        name: document.getElementById('regName').value.trim(),
        birthDate: document.getElementById('regBirth').value,
        height: parseInt(document.getElementById('regHeight').value),
        weight: parseFloat(document.getElementById('regWeight').value),
        targetWeight: parseFloat(document.getElementById('regTarget').value) || null,
        activityLevel: document.getElementById('regActivity').value,
        goal: document.getElementById('regGoal').value,
      };
      try {
        const d = await window.HT.apiPost('/auth/register', fields);
        localStorage.setItem('ht_token', d.accessToken);
        localStorage.setItem('ht_user', JSON.stringify(d.user));
        window.HT.showToast('Аккаунт создан!');
        window.location.hash = '#dashboard';
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });
  };
})();
