# seven-os\workers\autonomous-supervisor.ps1
Write-Host '=========================================================' -ForegroundColor Magenta
Write-Host '   SEVEN AUTONOMOUS OS: ENGINE WORKER SUPERVISOR BLOCK   ' -ForegroundColor Magenta
Write-Host '=========================================================' -ForegroundColor Magenta

$TsxBinary = "node_modules\.bin\tsx"
$WorkerScript = "seven-os\workers\payroll-worker\index.ts"

if (-not (Test-Path $TsxBinary)) {
    Write-Error "CRITICAL: tsx runner not found in local node_modules\.bin"
    Exit
}

while ($true) {
    Write-Host '🧹 [Supervisor] Clearing volatile execution cache layers...' -ForegroundColor Cyan
    # Directly clearing the output target path via native filesystem commands
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue }

    Write-Host '🔍 [Supervisor] Health check: Monitoring payroll-worker daemon...' -ForegroundColor Cyan
    $ProcessCheck = Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object { 
        try { $_.CommandLine -like '*payroll-worker*' } catch { $false }
    }

    if (-not $ProcessCheck) {
        Write-Host '⚠️ [Supervisor] Worker dropped! Directly re-spawning engine pipeline...' -ForegroundColor Red
        # Launching tsx directly via the verified node_modules binary path
        Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -Command & '$TsxBinary' '$WorkerScript'" -NoNewWindow
    } else {
        Write-Host '💪 [Supervisor] Active worker verified clean and on task.' -ForegroundColor Green
    }

    # Pause 30 seconds before next monitoring interval
    Start-Sleep -Seconds 30
}
