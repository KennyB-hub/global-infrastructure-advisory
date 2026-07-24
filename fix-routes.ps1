-$physicalFiles = Get-ChildItem -Path . -Recurse -Include *.js, *.ts, *.json, *.tsx, *.jsx -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*\node_modules\*" -and $_.FullName -notlike "*\.git\*" -and $_.FullName -notlike "*\dist\*" }
$assetRegistry = @{}
$physicalFiles | ForEach-Object { 
    $assetRegistry[$_.Name] = $_.FullName
    $assetRegistry[[System.IO.Path]::GetFileNameWithoutExtension($_.Name)] = $_.FullName 
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   NATIVE POWERSHELL ROUTE REPAIR & TRACER ENGINE   " -ForegroundColor Cyan
Write-Host "=====================================================`n"
Write-Host "Cataloged $($assetRegistry.Count) endpoints. Commencing trace and repair..." -ForegroundColor Yellow

$totalFixed = 0
foreach ($file in $physicalFiles) {
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $currentDir = Split-Path $file.FullName
        $hasChanges = $false
        
        # Regex designed explicitly to handle all single/double/backtick wrappers cleanly
        $pattern = '(?:require\s*\(\s*[''"`]([^''"`]+)['''`"]\s*\)|from\s*['''`"]([^''"`]+)['''`"]|import\s*\(\s*['''`"]([^''"`]+)['''`"]\s*\)|import\s+['''`"]([^''"`]+)['''`"])'
        $matches = [regex]::Matches($content, $pattern)
        
        foreach ($m in $matches) {
            # Safely aggregate the matched string value from capture groups 1, 2, 3, or 4
            $rawImport = $m.Groups[1].Value + $m.Groups[2].Value + $m.Groups[3].Value + $m.Groups[4].Value
            $cleanImport = $rawImport.Trim()
            
            if ($cleanImport.StartsWith('.') -or $cleanImport.StartsWith('/') -or $cleanImport.StartsWith('@')) {
                $testPath1 = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($currentDir, $cleanImport))
                $testPath2 = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine((Get-Location).Path, $cleanImport))
                
                $resolved = $false
                if (Test-Path $testPath1 -ErrorAction SilentlyContinue) { $resolved = $true }
                if (-not $resolved -and (Test-Path $testPath2 -ErrorAction SilentlyContinue)) { $resolved = $true }
                
                if (-not $resolved) {
                    $baseName = [System.IO.Path]::GetFileName($cleanImport)
                    $actualLoc = $assetRegistry[$baseName]
                    if (-not $actualLoc) { $actualLoc = $assetRegistry[[System.IO.Path]::GetFileNameWithoutExtension($baseName)] }
                    
                    if ($actualLoc) {
                        $rel = [System.IO.Path]::GetRelativePath($currentDir, $actualLoc).Replace('\', '/')
                        if (-not $rel.StartsWith('.')) { $rel = "./" + $rel }
                        
                        # Preserve extensionless routing conventions
                        if ([string]::IsNullOrEmpty([System.IO.Path]::GetExtension($cleanImport)) -and $rel.Contains('.')) {
                            $rel = $rel.Substring(0, $rel.LastIndexOf('.'))
                        }
                        
                        $oldStatement = $m.Value
                        $newStatement = $oldStatement.Replace($rawImport, $rel)
                        $content = $content.Replace($oldStatement, $newStatement)
                        $hasChanges = $true
                        $totalFixed++
                        Write-Host "   [REPAIRED] In $($file.Name): '$rawImport' -> '$rel'" -ForegroundColor Green
                    }
                }
            }
        }
        if ($hasChanges) { 
            [System.IO.File]::WriteAllText($file.FullName, $content) 
        }
    } catch {}
}
Write-Host "`nTrace complete! Fixed $totalFixed broken routing links safely." -ForegroundColor Cyan
