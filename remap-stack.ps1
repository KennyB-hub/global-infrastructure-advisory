$ErrorActionPreference = "Stop"

# Elevate session check to ensure Windows allows path link creations
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script requires Administrator privileges to link system pathways. Please restart PowerShell as Administrator."
    exit
}

$rootDir = Get-Location
$sevenOsDir = Join-Path $rootDir "seven-os"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "    SEVEN-OS RE-ALIGNED ROOT PATHWAY LINKER        " -ForegroundColor Cyan
Write-Host "====================================================`n"

# Map folders that got split or moved to ensure fallback compliance
# Syntax: "Target sitting at Root" -> "Virtual Link inside seven-os"
$mappings = @{
    "config"      = "seven-os\config"
    "ai"          = "seven-os\ai"
    "workers"     = "seven-os\workers"
    "system"      = "seven-os\system"
}

foreach ($srcName in $mappings.Keys) {
    $targetRelPath = $mappings[$srcName]
    $sourcePath = Join-Path $rootDir $srcName
    $destLinkPath = Join-Path $rootDir $targetRelPath

    # 1. If folder exists at root but is missing in seven-os, bridge it
    if (Test-Path $sourcePath) {
        if (-not (Test-Path $destLinkPath)) {
            $parentDir = Split-Path $destLinkPath
            if (-not (Test-Path $parentDir)) { New-Item -ItemType Directory -Path $parentDir -Force | Out-Null }
            
            Write-Host "Linking root path " -NoNewline
            Write-Host ".\$srcName" -ForegroundColor Yellow -NoNewline
            Write-Host " -> " -NoNewline
            Write-Host ".\$targetRelPath" -ForegroundColor Green
            
            # Create a native NTFS Directory Junction
            cmd /c "mklink /J `"$destLinkPath`" `"$sourcePath`"" | Out-Null
        } else {
            Write-Host "Pathway already synchronized: .\$targetRelPath" -ForegroundColor Gray
        }
    }
}

# 2. Fix the specific 'ai-engines' path anomaly flagged by code-filter.js and math-engine.js
$aiEnginesRoot = Join-Path $rootDir "ai-engines"
$aiEnginesNested = Join-Path $sevenOsDir "ai-engines"

if (-not (Test-Path $aiEnginesRoot) -and (Test-Path (Join-Path $sevenOsDir "ai\engines"))) {
    Write-Host "`nFixing ai-engines alias shift..." -ForegroundColor Cyan
    # Create the root folder if it was misplaced or grouped inside ai\engines
    New-Item -ItemType Directory -Path $aiEnginesRoot -Force | Out-Null
}

Write-Host "`nPathway links established! Rerun your audit-router framework tool." -ForegroundColor Green
