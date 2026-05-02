# Дневник питания и мониторинга здоровья

## Архитектура проекта

```
D:\health-tracker/
├── server/                    # Node.js/TypeScript бэкенд
│   ├── prisma/
│   │   ├── schema.prisma     # Модели БД
│   │   └── seed.js           # Начальные данные
│   ├── src/
│   │   ├── index.ts          # Точка входа, Express + WebSocket
│   │   ├── routes/
│   │   │   ├── auth.ts       # Регистрация, логин, профиль
│   │   │   ├── meals.ts      # Приёмы пищи, продукты
│   │   │   ├── health.ts     # Метрики здоровья (вес, давление)
│   │   │   ├── water.ts      # Водный баланс
│   │   │   ├── ai.ts         # AI-ассистент (DeepSeek)
│   │   │   └── export.ts     # Экспорт PDF
│   │   ├── middleware/
│   │   │   └── auth.ts       # JWT-аутентификация
│   │   └── services/
│   │       ├── nutrition.ts  # Расчёт норм BMR и БЖУ
│   │       ├── deepseek.ts   # Интеграция с DeepSeek API
│   │       └── pdf.ts        # Генерация PDF-отчётов
│   ├── package.json
│   └── tsconfig.json
│
├── client/                    # PWA (чистый HTML+JS, адаптивный)
│   ├── index.html            # Главная SPA-страница
│   ├── manifest.json         # PWA-манифест
│   ├── sw.js                 # Service Worker (кеш + push)
│   ├── src/
│   │   ├── app.js            # Ядро SPA (роутинг, состояние)
│   │   ├── api.js            # HTTP-клиент
│   │   ├── auth.js           # Логин/регистрация
│   │   ├── pages/
│   │   │   ├── login.html    # Экран входа
│   │   │   ├── dashboard.html # Главный дашборд с графиками
│   │   │   ├── meals.html    # Дневник питания
│   │   │   ├── health.html   # Здоровье (вес, давление)
│   │   │   ├── water.html    # Водный баланс
│   │   │   ├── ai.html       # AI-ассистент (чат)
│   │   │   └── profile.html  # Профиль и настройки
│   │   ├── components/
│   │   │   ├── wheel.js      # Колесо баланса здоровья
│   │   │   ├── chart.js      # Графики (Chart.js)
│   │   │   ├── scanner.js    # Сканер штрихкодов
│   │   │   ├── barcode.js    # Поиск по штрихкоду (Open Food Facts)
│   │   │   └── notification.js # Пуш-уведомления
│   │   └── utils/
│   │       ├── calc.js       # Расчёты (BMR, дефицит)
│   │       └── format.js     # Форматирование дат, чисел
│   └── package.json
```

## Модели данных (Prisma)

### users
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | Первичный ключ |
| email | String | Уникальный, для входа |
| password | String | Хэш bcrypt |
| name | String | Имя |
| birthDate | DateTime | 1985 (41 год) |
| height | Int | 175 см |
| weight | Float | 89 кг |
| targetWeight | Float | 80-82 кг |
| activityLevel | Enum | sedentary / light / moderate / active |
| goal | Enum | lose_weight / maintain |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### meals (приёмы пищи)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| type | Enum | breakfast / lunch / dinner / snack |
| datetime | DateTime | Когда съедено |
| totalCalories | Float | Сумма калорий |
| totalProtein | Float | |
| totalFat | Float | |
| totalCarbs | Float | |
| notes | String? | Комментарий |
| createdAt | DateTime | |

### meal_items (продукты в приёме)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| mealId | UUID | FK → meals |
| name | String | Название продукта |
| barcode | String? | Штрихкод |
| portion | Float | Вес порции в граммах |
| calories | Float | На 100г или на порцию |
| protein | Float | |
| fat | Float | |
| carbs | Float | |
| source | Enum | manual / barcode / template |

### food_templates (шаблоны блюд)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| name | String | «Мой завтрак» |
| items | JSON | Список продуктов |
| totalCalories | Float | |
| totalProtein | Float | |

### health_metrics (метрики здоровья)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| date | Date | Дата замера |
| weight | Float? | Вес, кг |
| systolic | Int? | Давление систола |
| diastolic | Int? | Давление диастола |
| pulse | Int? | Пульс |
| waist | Float? | Обхват талии, см |
| sleepQuality | Int? | 1-5 |
| stress | Int? | 1-5 |
| energy | Int? | 1-5 |
| morningErection | Int? | 1-5 (маркер мужского здоровья) |
| createdAt | DateTime | |

### water_log (водный баланс)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| date | Date | |
| amount | Int | мл |
| createdAt | DateTime | |

### ai_advice (рекомендации AI)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| date | Date | |
| text | Text | Рекомендация |
| type | Enum | daily_summary / meal_tip / health_tip |
| createdAt | DateTime | |

### daily_summary (ежедневная сводка)
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | |
| userId | UUID | FK → users |
| date | Date | |
| totalCalories | Float | |
| totalProtein | Float | |
| totalFat | Float | |
| totalCarbs | Float | |
| totalWater | Int | мл |
| aiAdviceId | UUID? | FK → ai_advice |
| createdAt | DateTime | |

## API Эндпоинты

### Auth
- `POST /api/v1/auth/register` — регистрация
- `POST /api/v1/auth/login` — вход (JWT)
- `GET /api/v1/auth/me` — профиль
- `PUT /api/v1/auth/profile` — обновление профиля

### Питание
- `GET /api/v1/meals?date=YYYY-MM-DD` — приёмы за день
- `POST /api/v1/meals` — добавить приём пищи
- `PUT /api/v1/meals/:id` — редактировать
- `DELETE /api/v1/meals/:id` — удалить
- `GET /api/v1/meals/templates` — шаблоны пользователя
- `POST /api/v1/meals/templates` — создать шаблон
- `GET /api/v1/products/search?q=...` — поиск продуктов (Open Food Facts / локальная база)
- `GET /api/v1/products/barcode/:code` — поиск по штрихкоду

### Здоровье
- `GET /api/v1/health?from=&to=` — метрики за период
- `POST /api/v1/health` — добавить замер
- `DELETE /api/v1/health/:id`
- `GET /api/v1/health/chart/weight` — данные для графика веса

### Вода
- `GET /api/v1/water?date=YYYY-MM-DD` — логи воды за день
- `POST /api/v1/water` — добавить стакан
- `GET /api/v1/water/today` — прогресс за сегодня

### AI
- `POST /api/v1/ai/analyze` — анализ дня + рекомендации
- `POST /api/v1/ai/chat` — чат с ассистентом (с контекстом)

### Экспорт
- `POST /api/v1/export/pdf` — сгенерировать PDF-отчёт за период

## Расчёт норм

**BMR (Мужчина, 41 год, 175см, 89кг):**
- Mifflin-St Jeor: 10 × 89 + 6.25 × 175 - 5 × 41 + 5 = 1782.75 ккал

**Суточная норма:**
- Минимальная активность (сидячая): BMR × 1.2 = 2139 ккал
- Цель: дефицит 15-20% → 1700-1820 ккал

**БЖУ (при дефиците):**
- Белок: 1.8-2.0 г/кг → 160-178 г
- Жиры: 0.8-1.0 г/кг → 71-89 г
- Углеводы: остаток ~130-150 г

**Вода:** 1.8-2.0 л/день (30 мл/кг + 300 мл при активности)

## DeepSeek AI Промпт (системный)

```
Ты — персональный AI-диетолог и health-коуч для мужчины 41 года (рост 175 см, вес 89 кг, цель — мягкое снижение веса до 80-82 кг). Твои рекомендации основаны на науке, без воды и маркетинга.

Твои принципы:
1. Анализируй дневник питания: калории, БЖУ, водный баланс.
2. Анализируй метрики здоровья: динамика веса, давление, пульс, качество сна.
3. Давай конкретные советы на основе данных, а не общие фразы.
4. Если недобор белка — предложи протеиновый перекус.
5. Если мало углеводов и была активность — посоветуй сложные углеводы.
6. Если повышено давление — напомни о дыхательной гимнастике и исключении солёного.
7. Учитывай возрастную потребность в магнии, цинке, коэнзиме Q10 — рекомендуй продукты-источники.
8. Последний приём пищи — за 3 часа до сна. Ложись до 23:00.
9. Будь строгим, конкретным, без эмодзи. Ты — не нянька, а тренер.
```

## PWA-функции
- **Service Worker:** кеширование статики, работа офлайн
- **Push-уведомления:** напоминания о воде, взвешивании, приёме пищи
- **Камера:** сканер штрихкодов через `navigator.mediaDevices` + `BarcodeDetector` API
- **Графики:** Chart.js для веса, колесо баланса через Canvas
- **Экспорт PDF:** jsPDF (уже есть в зависимостях)
- **Темы:** тёмная/светлая через CSS-переменные (как в складе)
