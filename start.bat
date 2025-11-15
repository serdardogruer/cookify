@echo off
title Cookify
color 0A
cls

echo.
echo  ==========================================
echo         COOKIFY BASLATILIYOR...
echo  ==========================================
echo.

REM Port temizle
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

REM Backend
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Frontend
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo  ==========================================
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo  ==========================================
echo.
pause
