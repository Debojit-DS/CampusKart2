# CampusKart Frontend Dev Server (Vite)
$root = $PSScriptRoot

Write-Host "==================================================" -ForegroundColor Yellow
Write-Host " CampusKart Frontend Dev Server (Vite)" -ForegroundColor Green
Write-Host " URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host " Root: $root" -ForegroundColor Gray
Write-Host " Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

Set-Location -LiteralPath $root
npm run dev
