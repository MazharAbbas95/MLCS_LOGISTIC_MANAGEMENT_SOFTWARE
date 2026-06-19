@echo off
:: MLCS Production Server Startup Script
:: Double-click this file, or add it to Windows Task Scheduler to run on boot

echo =============================================
echo   MLCS Logistic Management System
echo   Starting Production Server...
echo =============================================

cd /d "%~dp0"

:: Build if dist doesn't exist
if not exist "dist\index.html" (
    echo [!] No production build found. Building now...
    call npm run build
)

echo [OK] Starting server on http://localhost:3000
echo [OK] Accessible on your WiFi network at:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    echo      http://%%a:3000
)
echo.
echo [OK] Press Ctrl+C to stop the server
echo.

call npm run start
