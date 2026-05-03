// Application shell — загружается последним после всех страниц
(function() {
  'use strict';

  window.HT = window.HT || {};
  const HT = window.HT;

  // State
  let currentPage = '';

  // Modal
  function openModal(html) {
    const overlay = document.getElementById('modal');
    const body = document.getElementById('modalBody');
    body.innerHTML = html;
    overlay.classList.add('open');
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
  }
  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }
  function showToast(text, type) {
    type = type || 'success';
    const el = document.createElement('div');
    el.className = 'alert alert-' + type;
    el.textContent = text;
    el.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:300;max-width:400px;width:90%';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  HT.openModal = openModal;
  HT.closeModal = closeModal;
  HT.showToast = showToast;

  // Navigation
  function navigate(hash) {
    const page = hash.replace('#', '') || 'login';

    if (page !== 'login' && !HT.isLoggedIn()) {
      render('login');
      return;
    }
    if (page === 'login' && HT.isLoggedIn()) {
      window.location.hash = '#dashboard';
      return;
    }

    if (HT.pages && HT.pages[page]) {
      render(page);
    } else {
      window.location.hash = '#dashboard';
    }
  }

  function render(name) {
    const app = document.getElementById('app');
    const renderFn = HT.pages && HT.pages[name];
    if (renderFn) {
      app.innerHTML = renderFn();
    } else {
      app.innerHTML = '<div class="loading">Загрузка...</div>';
    }
    currentPage = name;

    // Nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === name);
    });

    // Init
    if (HT.initFns && HT.initFns[name]) {
      setTimeout(() => HT.initFns[name](), 50);
    }
  }

  HT.navigate = navigate;
  HT.render = render;

  // Update nav buttons after pages render
  function bindNav() {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = '#' + btn.dataset.page;
      });
    });
  }

  // Router
  window.addEventListener('hashchange', () => navigate(window.location.hash));

  // Swipe navigation
  const PAGE_ORDER = ['dashboard', 'meals', 'water', 'health', 'ai', 'profile'];
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaY = 0;
  const SWIPE_THRESHOLD = 60;
  const PULL_REFRESH_THRESHOLD = 100;

  document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    touchDeltaY = e.changedTouches[0].screenY - touchStartY;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;

    // Pull-to-refresh
    if (dy > PULL_REFRESH_THRESHOLD && window.scrollY === 0 && currentPage !== 'login') {
      HT.showToast('Обновляю...', 'info');
      if (HT.refreshFns && HT.refreshFns[currentPage]) {
        HT.refreshFns[currentPage]();
      }
      return;
    }

    // Swipe left/right — только если движение больше по X, чем по Y
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const idx = PAGE_ORDER.indexOf(currentPage);
      if (idx === -1) return;
      if (dx < 0 && idx < PAGE_ORDER.length - 1) {
        window.location.hash = '#' + PAGE_ORDER[idx + 1];
      } else if (dx > 0 && idx > 0) {
        window.location.hash = '#' + PAGE_ORDER[idx - 1];
      }
    }
  }, { passive: true });

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    bindNav();
    navigate(window.location.hash);
  });

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Request push notification permission
  async function requestNotifyPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  HT.requestNotifyPermission = requestNotifyPermission;
})();
