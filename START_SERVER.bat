@echo off
title Hotel New Kishan - Server
cd /d "c:\Users\Admin\Downloads\sai kisan app"
echo ==========================================
echo   Hotel New Kishan - Server Starting...
echo   Owner: Mr. Kuldip Khairnar
echo ==========================================
echo.
echo Customer: http://127.0.0.1:5000
echo Mobile:   http://192.168.0.182:5000
echo Admin:    http://127.0.0.1:5000/admin
echo.
echo Press CTRL+C to stop server
echo ==========================================
python server.py
pause
