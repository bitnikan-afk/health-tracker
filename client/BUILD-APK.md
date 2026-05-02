# APK сборка для Android
# Использует WebView — твой сайт как нативное приложение

# 1. Установи Capacitor (если нет Node модулей)
npm install -g @capacitor/core @capacitor/cli

# 2. Инициализируй в папке клиента
cd D:\health-tracker\client
npx cap init HealthTracker com.yourname.healthtracker

# 3. Добавь Android платформу
npx cap add android

# 4. Собери статику (если есть билд-шаг, пока просто скопируй)

# 5. Синхронизируй
npx cap copy

# 6. Открой в Android Studio
npx cap open android
# Установи Android Studio → Build → Build APK(s)

# Готово! .apk появится в android/app/build/outputs/apk/debug/
# Бонус: работает офлайн, если настроить кэш в WebView
