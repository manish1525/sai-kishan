@echo off
title Hotel New Kishan - Firewall Setup
echo ==========================================
echo   Firewall me Port 5000 open kar raha hai...
echo ==========================================
echo.

:: Firewall rule add karo
netsh advfirewall firewall delete rule name="Hotel New Kishan - Port 5000" >nul 2>&1
netsh advfirewall firewall add rule name="Hotel New Kishan - Port 5000" dir=in action=allow protocol=TCP localport=5000

echo.
echo ==========================================
echo   Aapka IP Address:
ipconfig | findstr "IPv4"
echo.
echo   Phone me ye URL kholo:
echo   http://192.168.0.200:5000
echo.
echo   NOTE: Phone aur Computer ek hi
echo   WiFi se connected hone chahiye!
echo ==========================================
pause
