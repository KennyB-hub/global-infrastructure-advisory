# seven-os\workers\autonomous-supervisor.ps1
Write-Host '=========================================================' -ForegroundColor Magenta
Write-Host '   SEVEN AUTONOMOUS OS: ENGINE WORKER SUPERVISOR BLOCK   ' -ForegroundColor Magenta
Write-Host '=========================================================' -ForegroundColor Magenta

\   = "D:\SevenOS\Runtime\seven-os\node_modules\.bin\tsx"
\ = "D:\SevenOS\Runtime\seven-os\workers\payroll-worker\index.ts"

if (-not (Test-Path \)) {
    Write-Error "CRITICAL: tsx runner not found in USB runtime node_modules\.bin"
    Exit
}

while (\True) {

    Write-Host '🧹 [Supervisor] Clearing volatile execution cache layers...' -ForegroundColor Cyan
    if (Test-Path "D:\SevenOS\Runtime\seven-os\dist") {
        Remove-Item -Recurse -Force "D:\SevenOS\Runtime\seven-os\dist" -ErrorAction SilentlyContinue
    }

    Write-Host '🔍 [Supervisor] Health check: Monitoring payroll-worker daemon...' -ForegroundColor Cyan
    \ = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        try { \.CommandLine -like "*payroll-worker*" } catch { \False }
    }

    if (-not \) {
        Write-Host '⚠️ [Supervisor] Worker dropped! Re-spawning engine pipeline...' -ForegroundColor Red
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command & "\" "\"" -NoNewWindow
    } else {
        Write-Host '💪 [Supervisor] Active worker verified clean and on task.' -ForegroundColor Green
    }

    Start-Sleep -Seconds 30
}
