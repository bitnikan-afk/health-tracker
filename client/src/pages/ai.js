// AI — AI-ассистент чат
(function() {
  window.HT.pages = window.HT.pages || {};
  window.HT.initFns = window.HT.initFns || {};

  window.HT.pages.ai = function() {
    return `
      <div style="padding-top:8px">
        <div class="flex-between mb-8">
          <h2 style="font-size:20px">🤖 AI-ассистент</h2>
          <button class="btn btn-sm btn-primary" id="aiAnalyzeBtn">📊 Анализ дня</button>
        </div>
        <div class="chat-messages" id="aiMessages">
          <div class="chat-msg assistant">Привет! Я персональный AI-диетолог. Могу проанализировать твой день, дать рекомендации по питанию или ответить на вопросы. Что хочешь узнать?</div>
        </div>
        <div class="chat-input-row">
          <input type="text" id="aiInput" placeholder="Спроси что-нибудь..." autocomplete="off">
          <button class="btn btn-primary btn-sm" id="aiSendBtn" style="width:auto;flex:0">→</button>
        </div>
        <div class="card mt-8">
          <div class="card-title" style="margin-bottom:8px">История советов</div>
          <div id="aiAdviceList"><div class="loading">Загрузка...</div></div>
        </div>
      </div>
    `;
  };

  window.HT.initFns.ai = async function() {
    await loadAdviceHistory();

    const input = document.getElementById('aiInput');
    const sendBtn = document.getElementById('aiSendBtn');

    async function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMessage(text, 'user');
      addMessage('Думаю...', 'assistant', 'thinking');
      try {
        const res = await window.HT.apiPost('/ai/chat', { message: text });
        const thinking = document.getElementById('thinking');
        if (thinking) thinking.remove();
        addMessage(res.response, 'assistant');
      } catch (e) {
        const thinking = document.getElementById('thinking');
        if (thinking) thinking.innerHTML = '<span style="color:var(--danger)">Ошибка: ' + e.message + '</span>';
      }
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    document.getElementById('aiAnalyzeBtn').addEventListener('click', async () => {
      const btn = document.getElementById('aiAnalyzeBtn');
      btn.disabled = true;
      btn.textContent = '⏳ Анализ...';
      addMessage('Проанализируй мой день и дай рекомендации.', 'user');
      addMessage('Анализирую...', 'assistant', 'thinking');
      try {
        const res = await window.HT.apiPost('/ai/analyze', {});
        const thinking = document.getElementById('thinking');
        if (thinking) thinking.remove();
        addMessage(res.advice, 'assistant');
      } catch (e) {
        const thinking = document.getElementById('thinking');
        if (thinking) thinking.innerHTML = '<span style="color:var(--danger)">Ошибка: ' + e.message + '</span>';
      } finally {
        btn.disabled = false;
        btn.textContent = '📊 Анализ дня';
      }
    });

    try {
      const msgs = await window.HT.apiGet('/ai/chat/history?limit=30');
      const container = document.getElementById('aiMessages');
      if (msgs.length > 0) container.innerHTML = '';
      for (const m of msgs) {
        addMessage(m.content, m.role);
      }
      container.scrollTop = container.scrollHeight;
    } catch {}
  };

  function addMessage(text, role, id) {
    const container = document.getElementById('aiMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    if (id) div.id = id;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  async function loadAdviceHistory() {
    try {
      const advice = await window.HT.apiGet('/ai/history?limit=5');
      const list = document.getElementById('aiAdviceList');
      if (!advice.length) {
        list.innerHTML = '<div class="text-muted text-sm">Нет сохранённых советов</div>';
      } else {
        list.innerHTML = advice.map(a =>
          '<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
          '<div class="text-muted text-sm mb-8">' + window.HT.formatTime(a.createdAt) + ' · ' + a.type + '</div>' +
          '<div>' + a.text.substring(0, 200) + (a.text.length > 200 ? '...' : '') + '</div>' +
          '</div>'
        ).join('');
      }
    } catch {}
  }
})();
