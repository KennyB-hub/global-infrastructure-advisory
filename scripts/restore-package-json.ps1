# scripts/restore-package-json.ps1
$branch = "protect/package-json"
git fetch origin $branch || exit 1
git checkout $branch -- package.json
Write-Host "Restored package.json from $branch. Review and commit on your working branch."
