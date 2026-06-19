:: MLCS Windows Firewall Setup
:: Run this ONCE as Administrator to configure Windows Firewall
:: This BLOCKS all internet access to port 3000 — only WiFi/LAN allowed

@echo off
echo =============================================
echo   MLCS Firewall Setup (Run as Administrator)
echo =============================================

:: Remove any existing MLCS rules first
netsh advfirewall firewall delete rule name="MLCS Server - Allow LAN" >nul 2>&1
netsh advfirewall firewall delete rule name="MLCS Server - Block Internet" >nul 2>&1

:: Allow traffic ONLY from private/local networks on port 3000
netsh advfirewall firewall add rule ^
  name="MLCS Server - Allow LAN" ^
  dir=in ^
  action=allow ^
  protocol=TCP ^
  localport=3000 ^
  remoteip=LocalSubnet,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,127.0.0.1

:: Block everything else on port 3000
netsh advfirewall firewall add rule ^
  name="MLCS Server - Block Internet" ^
  dir=in ^
  action=block ^
  protocol=TCP ^
  localport=3000 ^
  remoteip=any

echo.
echo [OK] Firewall rules applied!
echo [OK] Port 3000 is now ONLY accessible from your local WiFi/LAN
echo [OK] All internet/external access is BLOCKED
echo.
pause
