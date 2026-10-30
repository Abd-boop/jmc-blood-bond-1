@echo off
title JMC Blood Bond - Local Server
cd /d "%~dp0"
echo ========================================================
echo  Starting JMC Blood Bond Local Server...
echo ========================================================
echo  Local PC URL:  http://localhost:3000
echo  Mobile/Wi-Fi:  http://192.168.0.108:3000
echo ========================================================
npm run dev -- --host
pause

