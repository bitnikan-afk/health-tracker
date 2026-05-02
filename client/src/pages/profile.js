// Profile — профиль и настройки
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  window.HT.pages.profile = function() {
    const u = window.HT.getUser() || {};
    return `
      <div style="padding-top:8px">
        <h2 style="font-size:20px;margin-bottom:16px">👤 Профиль</h2>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Личные данные</div>
          <div class="form-group"><label>Имя</label><input class="form-input" id="pName" value="${u.name || ''}"></div>
          <div class="form-group"><label>Email</label><input class="form-input" type="email" id="pEmail" value="${u.email || ''}" disabled style="opacity:.6"></div>
          <div class="grid-2">
            <div class="form-group"><label>Рост (см)</label><input class="form-input" type="number" id="pHeight" value="${u.height || 175}"></div>
            <div class="form-group"><label>Вес (кг)</label><input class="form-input" type="number" id="pWeight" value="${u.weight || 89}" step="0.1"></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Целевой вес</label><input class="form-input" type="number" id="pTarget" value="${u.targetWeight || 82}" step="0.1"></div>
            <div class="form-group"><label>Активность</label>
              <select class="form-select" id="pActivity">
                <option value="sedentary" ${u.activityLevel === 'sedentary' ? 'selected' : ''}>Сидячая</option>
                <option value="light" ${u.activityLevel === 'light' ? 'selected' : ''}>Лёгкая</option>
                <option value="moderate" ${u.activityLevel === 'moderate' ? 'selected' : ''}>Умеренная</option>
                <option value="active" ${u.activityLevel === 'active' ? 'selected' : ''}>Высокая</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Цель</label>
            <select class="form-select" id="pGoal">
              <option value="lose_weight" ${u.goal === 'lose_weight' ? 'selected' : ''}>Снижение веса</option>
              <option value="maintain" ${u.goal === 'maintain' ? 'selected' : ''}>Поддержание</option>
            </select>
          </div>
          <button class="btn btn-primary" id="saveProfileBtn">Сохранить</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Настройки</div>
          <div class="form-group"><label>Тема</label>
            <select class="form-select" id="pTheme">
              <option value="dark">Тёмная</option>
              <option value="light">Светлая</option>
            </select>
          </div>
        </div>
        <div class="card">
          <button class="btn btn-danger mb-8" id="clearChatBtn">🗑️ Очистить историю чата</button>
          <button class="btn btn-danger" id="logoutBtn">🚪 Выйти</button>
        </div>
      </div>
    `;
  };

  window.HT.initFns.profile = function() {
    const theme = localStorage.getItem('ht_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('pTheme').value = theme;
    document.getElementById('pTheme').addEventListener('change', () => {
      const t = document.getElementById('pTheme').value;
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('ht_theme', t);
    });

    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
      try {
        await window.HT.apiPut('/auth/profile', {
          name: document.getElementById('pName').value.trim(),
          height: parseInt(document.getElementById('pHeight').value),
          weight: parseFloat(document.getElementById('pWeight').value),
          targetWeight: parseFloat(document.getElementById('pTarget').value) || null,
          activityLevel: document.getElementById('pActivity').value,
          goal: document.getElementById('pGoal').value,
        });
        // refresh user
        const u = await window.HT.apiGet('/auth/me');
        localStorage.setItem('ht_user', JSON.stringify(u));
        window.HT.showToast('Профиль обновлён');
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });

    document.getElementById('clearChatBtn').addEventListener('click', async () => {
      if (!confirm('Очистить всю историю чата с AI?')) return;
      try {
        await window.HT.apiDelete('/ai/chat/history');
        window.HT.showToast('История чата очищена');
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      if (confirm('Выйти?')) window.HT.logout();
    });
  };
})();
