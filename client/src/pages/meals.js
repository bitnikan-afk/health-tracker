// Meals — дневник питания
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  let searchTimer = null;

  window.HT.pages.meals = function() {
    return `
      <div style="padding-top:8px">
        <div class="flex-between mb-8">
          <h2 style="font-size:20px">🍽️ Питание</h2>
          <div class="btn-group" style="gap:6px">
            <button class="btn btn-sm btn-outline" id="mealToday">Сегодня</button>
            <input type="date" id="mealDate" value="${window.HT.todayStr()}" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);border-radius:var(--radius-sm);padding:4px 8px;font-size:12px">
          </div>
        </div>
        <div class="card" id="mealStats">
          <div class="stat-row">
            <div class="stat-item"><div class="stat-value" id="mealKcal">0</div><div class="stat-label">Ккал</div></div>
            <div class="stat-item"><div class="stat-value" id="mealProt">0</div><div class="stat-label">Белки</div></div>
            <div class="stat-item"><div class="stat-value" id="mealFat">0</div><div class="stat-label">Жиры</div></div>
            <div class="stat-item"><div class="stat-value" id="mealCarbs">0</div><div class="stat-label">Углеводы</div></div>
          </div>
        </div>
        <div class="btn-group mb-8">
          <button class="btn btn-sm btn-primary" data-type="breakfast">🌅 Завтрак</button>
          <button class="btn btn-sm btn-primary" data-type="lunch">☀️ Обед</button>
          <button class="btn btn-sm btn-primary" data-type="dinner">🌙 Ужин</button>
          <button class="btn btn-sm btn-primary" data-type="snack">🍪 Снек</button>
        </div>
        <div id="mealList"><div class="loading">Загрузка...</div></div>
      </div>
    `;
  };

  window.HT.initFns.meals = async function() {
    const date = document.getElementById('mealDate').value || window.HT.todayStr();
    await loadMeals(date);

    document.getElementById('mealDate').addEventListener('change', async (e) => {
      await loadMeals(e.target.value);
    });

    document.getElementById('mealToday').addEventListener('click', async () => {
      document.getElementById('mealDate').value = window.HT.todayStr();
      await loadMeals(window.HT.todayStr());
    });

    document.querySelectorAll('[data-type]').forEach(btn => {
      btn.addEventListener('click', () => openAddModal(btn.dataset.type));
    });
  };

  async function loadMeals(date) {
    try {
      const meals = await window.HT.apiGet('/meals?date=' + date);
      const list = document.getElementById('mealList');

      let html = '';
      if (!meals.length) {
        html = '<div class="text-muted text-center" style="padding:20px">Нет записей на этот день</div>';
      } else {
        for (const meal of meals) {
          html += `
            <div class="meal-item ${meal.type}">
              <div class="meal-header">
                <div>
                  <div class="meal-type">${typeLabel(meal.type)}</div>
                  <div class="meal-time">${window.HT.formatTime(meal.datetime)}</div>
                </div>
                <div class="meal-kcal">${meal.totalCalories} ккал</div>
              </div>
              <div class="stat-row" style="gap:4px;grid-template-columns:repeat(4,1fr);margin-top:6px">
                <div style="text-align:center;font-size:10px;color:var(--muted)">Б: ${window.HT.formatNum(meal.totalProtein)}</div>
                <div style="text-align:center;font-size:10px;color:var(--muted)">Ж: ${window.HT.formatNum(meal.totalFat)}</div>
                <div style="text-align:center;font-size:10px;color:var(--muted)">У: ${window.HT.formatNum(meal.totalCarbs)}</div>
                <div style="text-align:center;font-size:10px;color:var(--danger);cursor:pointer" data-delete="${meal.id}">✕</div>
              </div>
              <div class="meal-items">${meal.items.map(i => i.name + ' (' + i.portion + 'г, ' + i.calories + ' ккал)').join(', ')}</div>
            </div>
          `;
        }
      }

      list.innerHTML = html;

      list.querySelectorAll('[data-delete]').forEach(el => {
        el.addEventListener('click', async () => {
          if (confirm('Удалить?')) {
            await window.HT.apiDelete('/meals/' + el.dataset.delete);
            window.HT.showToast('Удалено');
            await loadMeals(document.getElementById('mealDate').value);
          }
        });
      });

      const totalKcal = meals.reduce((s, m) => s + m.totalCalories, 0);
      const totalProt = meals.reduce((s, m) => s + m.totalProtein, 0);
      const totalFat = meals.reduce((s, m) => s + m.totalFat, 0);
      const totalCarbs = meals.reduce((s, m) => s + m.totalCarbs, 0);
      document.getElementById('mealKcal').textContent = window.HT.formatKcal(totalKcal);
      document.getElementById('mealProt').textContent = window.HT.formatNum(totalProt);
      document.getElementById('mealFat').textContent = window.HT.formatNum(totalFat);
      document.getElementById('mealCarbs').textContent = window.HT.formatNum(totalCarbs);
    } catch (e) {
      document.getElementById('mealList').innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
    }
  }

  function typeLabel(type) {
    return { breakfast: '🌅 Завтрак', lunch: '☀️ Обед', dinner: '🌙 Ужин', snack: '🍪 Перекус' }[type] || type;
  }

  function openAddModal(type) {
    const now = new Date().toISOString().slice(11, 16);
    window.HT.openModal(`
      <button class="modal-close" onclick="window.HT.closeModal()">✕</button>
      <div class="modal-title">${typeLabel(type)}</div>
      <div class="form-group">
        <label>Время</label>
        <input class="form-input" type="time" id="mealTime" value="${now}">
      </div>
      <div class="form-group">
        <label>Комментарий</label>
        <input class="form-input" id="mealNotes" placeholder="Например: с коллегами в столовой">
      </div>
      <div class="card" style="background:var(--bg2)">
        <div class="card-title" style="margin-bottom:8px">Продукты</div>
        <div id="mealItems"></div>
        <button class="btn btn-sm btn-outline mt-8" id="addItemBtn">+ Добавить продукт</button>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="saveMealBtn">Сохранить</button>
        <button class="btn btn-outline" onclick="window.HT.closeModal()">Отмена</button>
      </div>
    `);

    function addItemRow(name, portion) {
      name = name || '';
      portion = portion || 100;
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;align-items:end;flex-wrap:wrap';
      div.innerHTML = `
        <div style="flex:2;min-width:120px"><label class="text-sm text-muted">Название</label><input class="form-input item-name" style="font-size:13px" value="${name}" placeholder="Поиск..."></div>
        <div style="flex:0 0 80px"><label class="text-sm text-muted">Граммы</label><input class="form-input item-portion" type="number" value="${portion}" style="font-size:13px"></div>
        <button class="btn btn-sm btn-danger item-remove" style="flex:0;width:auto;padding:6px 10px">✕</button>
      `;
      document.getElementById('mealItems').appendChild(div);

      div.querySelector('.item-name').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(async () => {
          const q = div.querySelector('.item-name').value.trim();
          if (q.length < 2) return;
          try { await window.HT.apiGet('/meals/search?q=' + encodeURIComponent(q)); } catch {}
        }, 400);
      });

      div.querySelector('.item-remove').addEventListener('click', () => div.remove());
    }

    addItemRow('', 100);

    document.getElementById('addItemBtn').addEventListener('click', () => addItemRow('', 100));

    document.getElementById('saveMealBtn').addEventListener('click', async () => {
      const time = document.getElementById('mealTime').value;
      const date = document.getElementById('mealDate').value || window.HT.todayStr();
      const notes = document.getElementById('mealNotes').value;

      const items = [];
      document.querySelectorAll('.item-name').forEach((el, i) => {
        const portion = parseFloat(document.querySelectorAll('.item-portion')[i]?.value) || 100;
        const name = el.value.trim();
        if (name) items.push({ name, portion });
      });

      if (!items.length) {
        window.HT.showToast('Добавьте хотя бы один продукт', 'error');
        return;
      }

      try {
        await window.HT.apiPost('/meals', { type, datetime: date + 'T' + time + ':00', items, notes: notes || undefined });
        window.HT.closeModal();
        window.HT.showToast('Приём пищи добавлен!');
        await loadMeals(date);
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });
  }
})();
