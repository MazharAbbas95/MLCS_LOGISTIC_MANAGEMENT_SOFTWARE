@echo off
:: ============================================================
:: MLCS SERVER SETUP SCRIPT
:: Run this ONCE on the dedicated server PC to set everything up
:: ============================================================

setlocal enabledelayedexpansion
title MLCS Server Setup

echo.
echo  =====================================================
echo    MLCS Logistic Management System - Server Setup
echo  =====================================================
echo.

:: ── Step 1: Check Node.js ─────────────────────────────────
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ERROR: Node.js is NOT installed!
    echo.
    echo  Please install Node.js first:
    echo  1. Open browser and go to: https://nodejs.org
    echo  2. Click "Download Node.js (LTS)"
    echo  3. Run the installer (keep all defaults)
    echo  4. Restart this script after installation
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo  OK: Node.js %NODE_VER% found

:: ── Step 2: Install packages ──────────────────────────────
echo.
echo [2/6] Installing packages (may take 1-2 minutes)...
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: npm install failed. Check internet connection.
    pause
    exit /b 1
)
echo  OK: All packages installed

:: ── Step 3: Generate Prisma client ────────────────────────
echo.
echo [3/6] Setting up database...
call npx prisma generate --silent >nul 2>&1
call npx prisma db push --skip-generate >nul 2>&1
echo  OK: Database ready at prisma\dev.db

:: ── Step 4: Create admin user ─────────────────────────────
echo.
echo [4/6] Creating admin user...
call npm run seed
echo  OK: Admin user ready

:: ── Step 5: Build production bundle ───────────────────────
echo.
echo [5/6] Building production files (takes ~30 seconds)...
call npm run build >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  ERROR: Build failed!
    pause
    exit /b 1
)
echo  OK: Production build complete

:: ── Step 6: Create startup shortcut ───────────────────────
echo.
echo [6/6] Setting up auto-start on Windows login...
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set BAT_FILE=%~dp0START_SERVER.bat
powershell -Command "$s=New-Object -ComObject WScript.Shell; $sc=$s.CreateShortcut('%STARTUP%\MLCS Server.lnk'); $sc.TargetPath='%BAT_FILE%'; $sc.WorkingDirectory='%~dp0'; $sc.WindowStyle=7; $sc.Description='MLCS Logistic Management System'; $sc.Save()"
echo  OK: Server will auto-start on login

:: ── Done ──────────────────────────────────────────────────
echo.
echo  =====================================================
echo    SETUP COMPLETE!
echo  =====================================================
echo.
echo  Your server is ready. Starting now...
echo.

:: Show this machine's IP address
echo  Staff can access the system at:
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    set IP=!IP: =!
    echo    http://!IP!:3000
)
echo.
echo  Username: admin
echo  Password: (whatever you set in Phase 1)
echo.
echo  Press any key to start the server...
pause >nul

call npm run start
