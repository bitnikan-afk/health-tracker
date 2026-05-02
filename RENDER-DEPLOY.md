# Health Tracker — запуск на Render.com

## 1. Создай GitHub репозиторий

## 2. Заливай код:
```bash
cd D:\health-tracker
git init
git add .
git commit -m "Initial"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/health-tracker.git
git push -u origin main
```

## 3. На Render.com
1. Зарегистрируйся на [render.com](https://render.com) (через GitHub)
2. Нажми **New → Web Service**
3. Выбери репозиторий health-tracker
4. Render сам найдет Dockerfile
5. Name: `health-tracker-api`
6. В Advanced добавь env vars:
   - `JWT_SECRET` → `health-tracker-secret-key-2026`
   - `DEEPSEEK_API_KEY` → `sk-764fffe94cdc4b3fb3e4ba84976a4411`
   - `DATABASE_URL` → `file:./dev.db`
   - `CORS_ORIGIN` → `https://health-tracker.onrender.com`
7. Create Web Service

8. **New → Static Site**
9. Name: `health-tracker`
10. Publish directory: `client`
11. Build command: оставь пустым
12. В Advanced → Add headers → Path `/*` →
    - `Cache-Control: no-cache`
13. В Advanced → Add rewrites:
    - Source `/api/*` → Destination `https://health-tracker-api.onrender.com/api/:splat`
14. Create Static Site

Готово! Твоя ссылка: `https://health-tracker.onrender.com`
