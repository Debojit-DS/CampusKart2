@echo off
title CampusKart Web App
echo Starting CampusKart Local Server on http://localhost:3000/ ...
powershell -ExecutionPolicy Bypass -File "%~dp0start_server.ps1"
pause
