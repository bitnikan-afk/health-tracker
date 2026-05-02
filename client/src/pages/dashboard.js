// Dashboard — главная
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  window.HT.pages.dashboard = function() {
    const user = window.HT.getUser();
    const age = user?.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 41;
    const bmr = window.HT.calcBMR(user?.weight || 89, user?.height || 175, age);
    const tdee = window.HT.calcTDEE(bmr, user?.activityLevel || 'sedentary');
    const macros = window.HT.calcMacros(user?.weight || 89, user?.goal || 'lose_weight', user?.activityLevel || 'sedentary');
    const waterGoal = window.HT.calcWater(user?.weight || 89, user?.activityLevel || 'sedentary');

    return `
      <div style="padding-top:8px">
        <h2 style="font-size:20px;margin-bottom:4px">Привет, ${user?.name || 'друг'}! 👋</h2>
        <p class="text-muted text-sm" style="margin-bottom:16px">${window.HT.todayStr()}</p>

        <div id="dashLoading" class="loading">Загрузка...</div>

        <div id="dashContent" style="display:none">
          <div class="card">
            <div class="card-header">
              <span class="card-title">Калории сегодня</span>
              <span id="dashCalLeft" style="font-size:13px;color:var(--text2)">—</span>
            </div>
            <div class="stat-row" id="dashCalRow">
              <div class="stat-item">
                <div class="stat-value" id="dashCalActual">0</div>
                <div class="stat-label">Съедено</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="dashCalTarget">${tdee}</div>
                <div class="stat-label">Норма</div>
              </div>
              <div class="stat-item">
                <div class="stat-value" id="dashProtein">0</div>
                <div class="stat-label">Белок (цель ${macros.protein}г)</div>
              </div>
            </div>
            <div class="progress-bar mt-8">
              <div class="progress-fill" id="dashCalProgress" style="width:0%;background:var(--accent)"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Вода</span>
              <span id="dashWaterText" style="font-size:13px;color:var(--text2)">0/${waterGoal} мл</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" id="dashWaterProgress" style="width:0%;background:var(--success)"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Вес (30 дней)</span>
            </div>
            <div style="height:200px"><canvas id="dashWeightChart"></canvas></div>
          </div>

          <div class="card">
            <div class="card-header">
              <span class="card-title">Баланс здоровья</span>
              <span style="font-size:12px;color:var(--text2)">Сегодня</span>
            </div>
            <div class="wheel-container"><canvas id="dashWheel" style="width:300px;height:300px;max-width:100%"></canvas></div>
          </div>

          <div class="card">
            <div class="card-header"><span class="card-title">Последний совет AI</span></div>
            <div id="dashAdvice" class="text-muted text-sm">—</div>
          </div>
        </div>
      </div>
    `;
  };

  window.HT.initFns.dashboard = async function() {
    try {
      const user = window.HT.getUser();
      const age = user?.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : 41;
      const bmr = window.HT.calcBMR(user?.weight || 89, user?.height || 175, age);
      const tdee = window.HT.calcTDEE(bmr, user?.activityLevel || 'sedentary');
      const macros = window.HT.calcMacros(user?.weight || 89, user?.goal || 'lose_weight', user?.activityLevel || 'sedentary');
      const waterGoal = window.HT.calcWater(user?.weight || 89, user?.activityLevel || 'sedentary');
      const today = window.HT.todayStr();

      const [meals, water, health, weightData, advice] = await Promise.all([
        window.HT.apiGet('/meals?date=' + today).catch(() => []),
        window.HT.apiGet('/water/today').catch(() => ({ total: 0, goal: waterGoal })),
        window.HT.apiGet('/health?from=' + today + '&to=' + today).catch(() => []),
        window.HT.apiGet('/health/chart/weight?days=30').catch(() => []),
        window.HT.apiGet('/ai/history?limit=1').catch(() => []),
      ]);

      document.getElementById('dashLoading').style.display = 'none';
      document.getElementById('dashContent').style.display = 'block';

      const totalCal = meals.reduce((s, m) => s + m.totalCalories, 0);
      const totalProt = meals.reduce((s, m) => s + m.totalProtein, 0);
      const pct = Math.min(100, Math.round(totalCal / (tdee * 0.85) * 100));

      document.getElementById('dashCalActual').textContent = window.HT.formatKcal(totalCal);
      const left = Math.round((tdee * 0.85) - totalCal);
      document.getElementById('dashCalLeft').textContent = left > 0 ? 'Осталось ' + left : 'Превышение ' + Math.abs(left);
      document.getElementById('dashProtein').textContent = window.HT.formatKcal(totalProt);
      document.getElementById('dashCalProgress').style.width = pct + '%';
      document.getElementById('dashWaterText').textContent = water.total + '/' + waterGoal + ' мл';
      document.getElementById('dashWaterProgress').style.width = (water.percent || 0) + '%';

      if (weightData.length > 1) {
        const canvas = document.getElementById('dashWeightChart');
        window.HT.createWeightChart(canvas, weightData);
      }

      const lastHealth = health?.[0] || {};
      window.HT.renderWheel(document.getElementById('dashWheel'), lastHealth);

      if (advice?.length) {
        document.getElementById('dashAdvice').innerHTML = advice[0].text;
      }
    } catch (e) {
      const el = document.getElementById('dashLoading');
      if (el) el.textContent = 'Ошибка загрузки';
    }
  };
})();
