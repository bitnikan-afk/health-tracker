// Health — здоровье
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  let chartInstance = null;

  window.HT.pages.health = function() {
    return `
      <div style="padding-top:8px">
        <h2 style="font-size:20px;margin-bottom:16px">❤️ Здоровье</h2>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Новый замер</div>
          <div class="grid-2">
            <div class="form-group"><label>Вес (кг)</label><input class="form-input" type="number" id="hWeight" step="0.1" placeholder="89"></div>
            <div class="form-group"><label>Дата</label><input class="form-input" type="date" id="hDate" value="${window.HT.todayStr()}"></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Давление сист.</label><input class="form-input" type="number" id="hSystolic" placeholder="120"></div>
            <div class="form-group"><label>Диаст.</label><input class="form-input" type="number" id="hDiastolic" placeholder="80"></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Пульс</label><input class="form-input" type="number" id="hPulse" placeholder="70"></div>
            <div class="form-group"><label>Талия (см)</label><input class="form-input" type="number" id="hWaist" step="0.5" placeholder="95"></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Сон (1-5)</label><input class="form-input" type="number" id="hSleep" min="1" max="5" placeholder="3"></div>
            <div class="form-group"><label>Стресс (1-5)</label><input class="form-input" type="number" id="hStress" min="1" max="5" placeholder="3"></div>
          </div>
          <div class="grid-2">
            <div class="form-group"><label>Энергия (1-5)</label><input class="form-input" type="number" id="hEnergy" min="1" max="5" placeholder="3"></div>
            <div class="form-group"><label>Утр. эрекция (1-5)</label><input class="form-input" type="number" id="hErection" min="1" max="5" placeholder="3"></div>
          </div>
          <button class="btn btn-primary" id="saveHealthBtn">Сохранить замер</button>
        </div>
        <div class="card">
          <div class="card-header">
            <span class="card-title">Вес</span>
            <div class="btn-group" style="gap:4px">
              <button class="btn btn-sm btn-outline" data-chart-days="30">30д</button>
              <button class="btn btn-sm btn-outline" data-chart-days="90">90д</button>
            </div>
          </div>
          <div style="height:220px"><canvas id="healthWeightChart"></canvas></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">История замеров</div>
          <div id="healthList"><div class="loading">Загрузка...</div></div>
        </div>
      </div>
    `;
  };

  window.HT.initFns.health = async function() {
    await loadHealth();

    document.getElementById('saveHealthBtn').addEventListener('click', async () => {
      const body = {
        date: document.getElementById('hDate').value,
        weight: document.getElementById('hWeight').value || undefined,
        systolic: document.getElementById('hSystolic').value || undefined,
        diastolic: document.getElementById('hDiastolic').value || undefined,
        pulse: document.getElementById('hPulse').value || undefined,
        waist: document.getElementById('hWaist').value || undefined,
        sleepQuality: document.getElementById('hSleep').value || undefined,
        stress: document.getElementById('hStress').value || undefined,
        energy: document.getElementById('hEnergy').value || undefined,
        morningErection: document.getElementById('hErection').value || undefined,
      };

      try {
        await window.HT.apiPost('/health', body);
        window.HT.showToast('Замер сохранён');
        await loadHealth();
      } catch (e) {
        window.HT.showToast(e.message, 'error');
      }
    });

    document.querySelectorAll('[data-chart-days]').forEach(btn => {
      btn.addEventListener('click', async () => await loadWeightChart(btn.dataset.chartDays));
    });
  };

  async function loadHealth() {
    try {
      const to = window.HT.todayStr();
      const from = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
      const [metrics, weightData] = await Promise.all([
        window.HT.apiGet('/health?from=' + from + '&to=' + to),
        window.HT.apiGet('/health/chart/weight?days=90'),
      ]);

      await loadWeightChart(30);

      const list = document.getElementById('healthList');
      if (!metrics.length) {
        list.innerHTML = '<div class="text-muted text-center" style="padding:16px">Нет замеров</div>';
      } else {
        list.innerHTML = metrics.slice().reverse().slice(0, 20).map(m => {
          const d = new Date(m.date);
          const dateStr = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
          return '<div class="flex-between" style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
            '<span>' + dateStr + '</span>' +
            '<span>' + (m.weight ? m.weight + ' кг' : '') + ' ' + (m.systolic ? m.systolic + '/' + m.diastolic : '') + '</span>' +
            '<span style="color:var(--danger);cursor:pointer" data-del="' + m.id + '">✕</span>' +
            '</div>';
        }).join('');

        list.querySelectorAll('[data-del]').forEach(el => {
          el.addEventListener('click', async () => {
            await window.HT.apiDelete('/health/' + el.dataset.del);
            window.HT.showToast('Удалено');
            await loadHealth();
          });
        });
      }
    } catch {}
  }

  async function loadWeightChart(days) {
    try {
      const data = await window.HT.apiGet('/health/chart/weight?days=' + days);
      if (data.length > 1) {
        const canvas = document.getElementById('healthWeightChart');
        if (chartInstance) chartInstance.destroy();
        chartInstance = window.HT.createWeightChart(canvas, data);
      }
    } catch {}
  }
})();
