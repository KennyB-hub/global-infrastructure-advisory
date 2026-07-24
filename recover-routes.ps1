$ErrorActionPreference = "Stop"

# Define base structural layouts
$rootDir = Get-Location
$appDir = Join-Path $rootDir "seven-os"

# List of missing relative files exactly as outputted by your seven-os audit report
$missingPaths = @(
    "config\cluster-health.json",
    "ai\audit-engine.js",
    "ai\engines\math-engine.js",
    "ai\engines\math-mapping-engine.js",
    "ai\engines\logic-engine.js",
    "ai\engines\data-engine.js",
    "ai\engines\sector-contractor-engine.js",
    "ai\engines\sector-farmer-engine.js",
    "ai\engines\sector-public-engine.js",
    "ai\engines\sector-gov-engine.js",
    "ai\engines\sector-deepgov-engine.js",
    "ai\engines\sector-alfa-engine.js",
    "data\mock-data.js",
    "ai\schema-registry.js",
    "ai\tools\security\index.js",
    "ai\tools\gov\index.js",
    "ai\tools\public\formatBriefing.js",
    "ai\tools\public\summarizeForPublic.js",
    "ai\tools\infra-inspector.js",
    "ai\workflow\index.js",
    "ai-engines\utils\context.js",
    "ai\hooks\after-execution.js",
    "workers\system\cyber\anomaly.engine.js",
    "functions\api\opportunity.js",
    "workers\system\marketplace.engine.js",
    "system\api\sector-match.js"
)

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "     SEVEN-OS AUTONOMOUS FILE RECOVERY SEARCH       " -ForegroundColor Cyan
Write-Host "====================================================`n"

$foundMatches = @()

foreach ($relPath in $missingPaths) {
    # Extract just the filename to hunt for misplacements
    $fileName = [System.IO.Path]::GetFileName($relPath)
    $targetDestination = Join-Path $appDir $relPath
    
    Write-Host "Searching for misplaced file: " -NoNewline
    Write-Host "$fileName" -ForegroundColor Yellow

    # Search everywhere EXCEPT inside the correct target seven-os nested path
    $searchMatches = Get-ChildItem -Path $rootDir -Recurse -File -Filter $fileName -ErrorAction SilentlyContinue | 
        Where-Object { $_.FullName -notlike "*\seven-os\$relPath*" -and $_.FullName -notlike "*\node_modules\*" }

    if ($searchMatches) {
        # Take the most likely candidate file found out of context
        $sourceFile = $searchMatches[0]
        Write-Host "  [FOUND]: " -NoNewline -ForegroundColor Green
        Write-Host "$($sourceFile.FullName)" -ForegroundColor Gray
        
        $foundMatches += [PSCustomObject]@{
            Source      = $sourceFile.FullName
            Destination = $targetDestination
            RelPath     = $relPath
        }
    } else {
        Write-Host "  [NOT FOUND ANYWHERE]" -ForegroundColor Red
    }
}

Write-Host "`nSearch Complete. Found $($foundMatches.Count) matches out of $($missingPaths.Count) missing targets.`n" -ForegroundColor Cyan

if ($foundMatches.Count -eq 0) {
    Write-Host "No files could be found to auto-move. Check manual code adjustments." -ForegroundColor Yellow
    exit
}

# Prompt confirmation to ensure no operations execute blindly
$confirmation = Read-Host "Would you like the script to safely move these files back into 'seven-os'? (Y/N)"
if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
    foreach ($match in $foundMatches) {
        $destDir = [System.IO.Path]::GetDirectoryName($match.Destination)
        
        # Build missing tree structures dynamically if directory levels are broken
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        # Safe transactional execution
        Move-Item -Path $match.Source -Destination $match.Destination -Force
        Write-Host "Restored: " -NoNewline -ForegroundColor Green
        Write-Host "$($match.RelPath)"
    }
    Write-Host "`nAll operations complete! Rerun your audit-router script." -ForegroundColor Green
} else {
    Write-Host "Operation cancelled. No changes made." -ForegroundColor Yellow
}
