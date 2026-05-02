@echo off
echo Starting Health Tracker...
echo.

echo 1. Killing old processes...
taskkill /f /t /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. Starting API server (port 4000)...
start "HT-API" cmd /c "cd /d D:\health-tracker\server && node dist\index.js"

timeout /t 3 /nobreak >nul

echo 3. Starting client server (port 3000)...
start "HT-Client" cmd /c "cd /d D:\health-tracker\client && node serve.js"

timeout /t 2 /nobreak >nul

echo.
echo Both servers started!
echo API: http://localhost:4000
echo Client: http://localhost:3000
echo.
echo Close windows with Ctrl+C
pause
