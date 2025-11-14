@echo off
echo ========================================
echo    Cookify Development Servisleri
echo ========================================
echo.
echo Backend ve Frontend servisleri baslatiliyor...
echo.

REM Backend servisini yeni pencerede başlat
start "Cookify Backend" cmd /k "cd /d %~dp0..\backend && npm run dev"

REM 2 saniye bekle
timeout /t 2 /nobreak >nul

REM Frontend servisini yeni pencerede başlat
start "Cookify Frontend" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo.
echo ========================================
echo Servisler baslatildi!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Bu pencereyi kapatabilirsin.
echo Servisleri durdurmak icin acilan pencereleri kapat.
echo.
pause
