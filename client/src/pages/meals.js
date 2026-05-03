// Meals — дневник питания + шаблоны
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  let searchTimer = null;
  let currentTemplates = [];

  window.HT.pages.meals = function() {
    return `
      <div style="padding-top:8px">
        <div class="tabs" style="margin-bottom:12px">
          <div class="tab active" data-meal-tab="log">🍽️ Дневник</div>
          <div class="tab" data-meal-tab="templates">📋 Шаблоны</div>
        </div>

        <div id="mealLog">
          <div class="flex-between mb-8">
            <h2 style="font-size:20px">Питание</h2>
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

        <div id="mealTemplates" style="display:none">
          <div class="flex-between mb-8">
            <h2 style="font-size:20px">📋 Мои шаблоны</h2>
            <button class="btn btn-sm btn-primary" id="addTemplateBtn">+ Новый шаблон</button>
          </div>
          <div id="templateList"><div class="loading">Загрузка...</div></div>
        </div>
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

    // Tab switching
    document.querySelectorAll('[data-meal-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-meal-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('mealLog').style.display = tab.dataset.mealTab === 'log' ? 'block' : 'none';
        document.getElementById('mealTemplates').style.display = tab.dataset.mealTab === 'templates' ? 'block' : 'none';
        if (tab.dataset.mealTab === 'templates') loadTemplates();
      });
    });

    document.getElementById('addTemplateBtn').addEventListener('click', showAddTemplateModal);
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
              <button class="btn btn-sm btn-outline save-template-btn" data-mealid="${meal.id}" style="margin-top:6px">💾 В шаблон</button>
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

      list.querySelectorAll('.save-template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const mealId = btn.dataset.mealid;
          const meal = meals.find(m => m.id === mealId);
          if (!meal) return;
          const name = prompt('Название шаблона:', typeLabel(meal.type) + ' (' + window.HT.todayStr() + ')');
          if (!name) return;
          try {
            await window.HT.apiPost('/meals/templates', {
              name,
              items: meal.items.map(i => ({ name: i.name, portion: i.portion, barcode: i.barcode }))
            });
            window.HT.showToast('Шаблон сохранён!');
          } catch (e) {
            window.HT.showToast(e.message, 'error');
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

  // ========== Шаблоны ==========

  async function loadTemplates() {
    try {
      currentTemplates = await window.HT.apiGet('/meals/templates');
      const list = document.getElementById('templateList');

      if (!currentTemplates.length) {
        list.innerHTML = '<div class="text-muted text-center" style="padding:20px">Шаблонов пока нет. Сохраните приём пищи как шаблон.</div>';
        return;
      }

      let html = '';
      for (const t of currentTemplates) {
        const items = t.items || [];
        html += `
          <div class="card">
            <div class="flex-between">
              <div class="card-title" style="margin:0;font-size:15px;text-transform:none">${t.name}</div>
              <div style="font-size:12px;color:var(--muted)">${Math.round(t.totalCalories)} ккал</div>
            </div>
            <div style="font-size:12px;color:var(--muted);margin:4px 0">${items.map(i => i.name).join(', ')}</div>
            <div style="font-size:11px;color:var(--text2);margin-bottom:8px">
              Б:${Math.round(t.totalProtein)} Ж:${Math.round(t.totalFat)} У:${Math.round(t.totalCarbs)}
            </div>
            <div class="btn-group" style="gap:4px">
              <button class="btn btn-sm btn-primary apply-template-btn" data-tplid="${t.id}">📋 Применить</button>
              <button class="btn btn-sm btn-danger delete-template-btn" data-tplid="${t.id}">✕</button>
            </div>
          </div>
        `;
      }

      list.innerHTML = html;

      list.querySelectorAll('.apply-template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tpl = currentTemplates.find(t => t.id === btn.dataset.tplid);
          if (tpl) openAddModalFromTemplate(tpl);
        });
      });

      list.querySelectorAll('.delete-template-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Удалить шаблон?')) return;
          try {
            await window.HT.apiDelete('/meals/templates/' + btn.dataset.tplid);
            window.HT.showToast('Шаблон удалён');
            loadTemplates();
          } catch (e) {
            window.HT.showToast(e.message, 'error');
          }
        });
      });
    } catch (e) {
      document.getElementById('templateList').innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
    }
  }

  function showAddTemplateModal() {
    const name = prompt('Название нового шаблона:');
    if (!name) return;
    openAddModalFromTemplate(null, name);
  }

  function openAddModalFromTemplate(template, newTemplateName) {
    const now = new Date().toISOString().slice(11, 16);
    const items = template ? (template.items || []) : [];

    window.HT.openModal(`
      <button class="modal-close" onclick="window.HT.closeModal()">✕</button>
      <div class="modal-title">${template ? '📋 ' + template.name : '📋 Новый шаблон: ' + newTemplateName}</div>
      <div class="form-group">
        <label>Тип</label>
        <select class="form-input" id="modalType">
          <option value="breakfast">🌅 Завтрак</option>
          <option value="lunch">☀️ Обед</option>
          <option value="dinner">🌙 Ужин</option>
          <option value="snack">🍪 Снек</option>
        </select>
      </div>
      <div class="form-group">
        <label>Время</label>
        <input class="form-input" type="time" id="modalTime" value="${now}">
      </div>
      <div class="card" style="background:var(--bg2)">
        <div class="card-title" style="margin-bottom:8px">Продукты</div>
        <div id="modalItems">
          ${items.map(i => `
            <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">
              <input class="form-input item-name" value="${i.name}" style="flex:2;font-size:13px">
              <input class="form-input item-portion" type="number" value="${i.portion || 100}" style="flex:0 0 70px;font-size:13px">
              <button class="btn btn-sm btn-danger item-remove" style="padding:6px 8px">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-sm btn-outline mt-8" id="addItemBtn">+ Продукт</button>
      </div>
      <div class="modal-actions" style="margin-top:12px">
        <button class="btn btn-primary" id="saveFromTemplateBtn">Добавить</button>
        ${template ? '<button class="btn btn-outline" id="saveAsNewTplBtn" style="margin-left:6px">💾 Как новый шаблон</button>' : ''}
        <button class="btn btn-outline" onclick="window.HT.closeModal()">Отмена</button>
      </div>
    `);

    document.getElementById('addItemBtn').addEventListener('click', () => {
      const container = document.getElementById('modalItems');
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:6px;margin-bottom:6px;align-items:center';
      div.innerHTML = `
        <input class="form-input item-name" placeholder="Название" style="flex:2;font-size:13px">
        <input class="form-input item-portion" type="number" value="100" style="flex:0 0 70px;font-size:13px">
        <button class="btn btn-sm btn-danger item-remove" style="padding:6px 8px">✕</button>
      `;
      container.appendChild(div);
      div.querySelector('.item-remove').addEventListener('click', () => div.remove());
    });

    document.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('[style*="display:flex"]')?.remove());
    });

    document.getElementById('saveFromTemplateBtn').addEventListener('click', async () => {
      const type = document.getElementById('modalType').value;
      const date = document.getElementById('mealDate')?.value || window.HT.todayStr();
      const time = document.getElementById('modalTime').value;

      const products = [];
      document.querySelectorAll('#modalItems .item-name').forEach(el => {
        const name = el.value.trim();
        if (!name) return;
        const row = el.closest('[style*="display:flex"]');
        const portion = parseFloat(row?.querySelector('.item-portion')?.value) || 100;
        products.push({ name, portion });
      });

      if (!products.length) { window.HT.showToast('Добавьте продукты', 'error'); return; }

      try {
        await window.HT.apiPost('/meals', {
          type, datetime: date + 'T' + time + ':00', items: products
        });
        window.HT.closeModal();
        window.HT.showToast('Добавлено!');
        await loadMeals(date);
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });

    const saveAsBtn = document.getElementById('saveAsNewTplBtn');
    if (saveAsBtn) {
      saveAsBtn.addEventListener('click', async () => {
        const name = prompt('Название нового шаблона:', template.name + ' (копия)');
        if (!name) return;
        const products = [];
        document.querySelectorAll('#modalItems .item-name').forEach(el => {
          const n = el.value.trim();
          if (!n) return;
          const row = el.closest('[style*="display:flex"]');
          const portion = parseFloat(row?.querySelector('.item-portion')?.value) || 100;
          products.push({ name: n, portion });
        });
        if (!products.length) { window.HT.showToast('Добавьте продукты', 'error'); return; }
        try {
          await window.HT.apiPost('/meals/templates', { name, items: products });
          window.HT.showToast('Шаблон сохранён!');
        } catch (e) {
          window.HT.showToast(e.message, 'error');
        }
      });
    }
  }

  // ========== Обычное добавление (с кнопкой "Сохранить как шаблон") ==========

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
      <div class="modal-actions" style="margin-top:12px">
        <button class="btn btn-primary" id="saveMealBtn">Сохранить</button>
        <button class="btn btn-outline" id="saveAsTemplateBtn">💾 Как шаблон</button>
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
          try {
            const products = await window.HT.apiGet('/meals/search?q=' + encodeURIComponent(q));
            let hintBox = div.querySelector('.hint-box');
            if (!hintBox) {
              hintBox = document.createElement('div');
              hintBox.className = 'hint-box';
              hintBox.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);max-height:150px;overflow-y:auto;font-size:13px;margin-top:2px';
              div.appendChild(hintBox);
            }
            if (products.length === 0) { hintBox.innerHTML = '<div class="text-muted" style="padding:6px 8px">Ничего не найдено</div>'; return; }
            hintBox.innerHTML = products.map(p =>
              '<div style="padding:6px 8px;cursor:pointer;border-bottom:1px solid var(--border)" data-name="' +
              (p.nameRu || p.name) + '" data-kcal="' + p.caloriesPer100g + '" data-prot="' + p.proteinPer100g +
              '" data-fat="' + p.fatPer100g + '" data-carbs="' + p.carbsPer100g + '">' +
              (p.nameRu || p.name) + ' — ' + Math.round(p.caloriesPer100g) + ' ккал/100г</div>'
            ).join('');
            hintBox.querySelectorAll('[data-name]').forEach(el => {
              el.addEventListener('click', () => {
                div.querySelector('.item-name').value = el.dataset.name;
                hintBox.remove();
              });
            });
          } catch {}
        }, 400);
      });

      div.querySelector('.item-name').addEventListener('blur', () => {
        setTimeout(() => { const h = div.querySelector('.hint-box'); if (h) h.remove(); }, 200);
      });
      div.querySelector('.item-name').addEventListener('focus', () => {
        if (div.querySelector('.hint-box')) return;
        const q = div.querySelector('.item-name').value.trim();
        if (q.length < 2) return;
        const evt = new Event('input');
        div.querySelector('.item-name').dispatchEvent(evt);
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

    document.getElementById('saveAsTemplateBtn').addEventListener('click', async () => {
      const items = [];
      document.querySelectorAll('.item-name').forEach((el, i) => {
        const portion = parseFloat(document.querySelectorAll('.item-portion')[i]?.value) || 100;
        const name = el.value.trim();
        if (name) items.push({ name, portion });
      });
      if (!items.length) { window.HT.showToast('Добавьте продукты', 'error'); return; }

      const name = prompt('Название шаблона:', typeLabel(type) + ' (' + window.HT.todayStr() + ')');
      if (!name) return;
      try {
        await window.HT.apiPost('/meals/templates', { name, items });
        window.HT.showToast('Шаблон сохранён!');
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });
  }
})();
