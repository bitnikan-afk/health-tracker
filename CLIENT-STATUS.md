# Health Tracker — запуск проекта

## Статус (2 мая)
Оба сервера работают, клиент доступен по WiFi и PWA-ready.

### Что есть
- **Сервер** (Node/TypeScript, Express, Prisma/SQLite, Socket.io) — порт 4000
  - DeepSeek AI-чат с историей диалога ✅
  - Авторасчёт КБЖУ по продукту + порция ✅
  - Поиск по штрихкоду (с Open Food Facts) ✅
  - API: `/api/v1/{auth|meals|health|water|ai}`

- **Клиент** (чистый HTML+CSS+JS SPA) — порт 3000
  - Тёмная тема, адаптивный дизайн, мобильная навигация
  - 6 страниц: дашборд, питание, здоровье, вода, AI, профиль
  - PWA: Service Worker, manifest.json
  - Прокси через `/api` → бэкенд (port 4000)

- **Тестовый пользователь** в БД: andrey@health.app / health2026

### Как запустить
```bash
# Через start.bat (одной кнопкой)
D:\health-tracker\start.bat

# Или вручную:
cd D:\health-tracker\server && node dist\index.js
cd D:\health-tracker\client && node serve.js

# Доступ
# Комп: http://localhost:3000
# Телефон: http://192.168.x.x:3000
```

### Решённые проблемы
- ES modules не работали в браузере — переписано на IIFE + глобальный `window.HT`
- API-прокси резал `/api` префикс — исправлен pathRewrite
- Регистрация падала с 500/400 — исправлен `birthDate: new Date("")`
- Отсутствовали PWA-иконки — сгенерированы SVG (цветной фон + 💪)
