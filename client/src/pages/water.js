// Water — водный баланс
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  window.HT.pages.water = function() {
    return `
      <div style="padding-top:8px">
        <h2 style="font-size:20px;margin-bottom:16px">💧 Водный баланс</h2>
        <div class="card text-center">
          <div class="water-label"><span id="waterTotal">0</span> <span style="font-size:14px;color:var(--text2)">/ 2000 мл</span></div>
          <div class="water-sub">Осталось <span id="waterLeft">2000</span> мл</div>
          <div class="water-glass-container" id="waterGlass">
            <div class="water-glass"><div class="water-fill" id="waterFill" style="height:0%"></div></div>
          </div>
          <div class="btn-group" style="max-width:300px;margin:0 auto">
            <button class="btn btn-primary" data-water="250">🥛 250 мл</button>
            <button class="btn btn-primary" data-water="330">🍺 330 мл</button>
            <button class="btn btn-primary" data-water="500">🧴 500 мл</button>
          </div>
          <button class="btn btn-outline mt-8" id="customWaterBtn">Свой объём</button>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:8px">История сегодня</div>
          <div id="waterLogs"><div class="loading">Загрузка...</div></div>
        </div>
      </div>
    `;
  };

  window.HT.initFns.water = async function() {
    await loadWater();

    document.querySelectorAll('[data-water]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const amount = parseInt(btn.dataset.water);
        try {
          await window.HT.apiPost('/water', { amount });
          window.HT.showToast(amount + ' мл добавлено');
          await loadWater();
        } catch (e) {
          window.HT.showToast(e.message, 'error');
        }
      });
    });

    document.getElementById('customWaterBtn').addEventListener('click', () => {
      const amount = prompt('Объём воды (мл):', '250');
      if (amount && parseInt(amount) > 0) {
        window.HT.apiPost('/water', { amount: parseInt(amount) })
          .then(() => { window.HT.showToast(amount + ' мл добавлено'); loadWater(); })
          .catch(e => window.HT.showToast(e.message, 'error'));
      }
    });
  };

  async function loadWater() {
    try {
      const data = await window.HT.apiGet('/water?date=' + window.HT.todayStr());
      const total = data.total || 0;
      const goal = data.goal || 2000;
      const pct = Math.min(100, Math.round(total / goal * 100));

      document.getElementById('waterTotal').textContent = total;
      document.getElementById('waterLeft').textContent = Math.max(0, goal - total);
      document.getElementById('waterFill').style.height = pct + '%';

      const logs = document.getElementById('waterLogs');
      if (!data.logs?.length) {
        logs.innerHTML = '<div class="text-muted text-center" style="padding:12px">Нет записей</div>';
      } else {
        logs.innerHTML = data.logs.map(l =>
          '<div class="flex-between" style="padding:6px 0;font-size:13px">' +
          '<span>' + window.HT.formatTime(l.createdAt) + '</span>' +
          '<span style="font-weight:600">+' + l.amount + ' мл</span>' +
          '</div>'
        ).join('');
      }
    } catch (e) {
      document.getElementById('waterLogs').innerHTML = '<div class="alert alert-error">' + e.message + '</div>';
    }
  }
})();
