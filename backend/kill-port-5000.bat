@echo off
echo Port 5000'i temizliyorum...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do (
    echo Process ID: %%a
    taskkill /F /PID %%a
)
echo Tamamlandi!
