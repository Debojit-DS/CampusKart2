# CampusKart Lightweight Local Web Server (PowerShell HttpListener)
$port = 3000
$url = "http://localhost:$port/"
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host " CampusKart Frontend Server Running" -ForegroundColor Green
    Write-Host " URL: $url" -ForegroundColor Cyan
    Write-Host " Root: $root" -ForegroundColor Gray
    Write-Host " Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Yellow

    # Automatically launch the default web browser
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrEmpty($localPath) -or $localPath -eq "/") {
            $localPath = "index.html"
        }

        $filePath = Join-Path $root $localPath.Replace('/', '\')

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".json" { "application/json; charset=utf-8" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                default { "application/octet-stream" }
            }

            $response.ContentType = $contentType
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        else {
            $response.StatusCode = 404
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("File Not Found: $localPath")
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
