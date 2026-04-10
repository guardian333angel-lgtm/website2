param(
  [string]$Message = '',
  [switch]$AllowEmpty
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoRoot

$insideRepo = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $insideRepo -ne 'true') {
  throw 'This folder is not a Git repository.'
}

$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($remote)) {
  throw 'Git remote origin is not configured.'
}

git add .

$oversized = git ls-files | ForEach-Object {
  $itemPath = Join-Path $repoRoot $_
  if (Test-Path $itemPath) {
    $item = Get-Item $itemPath
    if (-not $item.PSIsContainer -and $item.Length -gt 100MB) {
      [PSCustomObject]@{
        Path = $_
        SizeMB = [Math]::Round($item.Length / 1MB, 2)
      }
    }
  }
} | Where-Object { $_ }

if ($oversized) {
  Write-Host 'Cannot publish: GitHub blocks files larger than 100 MB in standard git pushes.' -ForegroundColor Red
  $oversized | ForEach-Object {
    Write-Host (" - {0} ({1} MB)" -f $_.Path, $_.SizeMB) -ForegroundColor Yellow
  }
  throw 'Remove or shrink oversized files, then publish again.'
}

$changes = git status --porcelain
if ([string]::IsNullOrWhiteSpace(($changes | Out-String)) -and -not $AllowEmpty) {
  Write-Host 'No local changes to publish.'
  exit 0
}

if ([string]::IsNullOrWhiteSpace($Message)) {
  $Message = 'Site update ' + (Get-Date -Format 'yyyy-MM-dd HH:mm')
}

git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  throw 'Git commit failed.'
}

git push
if ($LASTEXITCODE -ne 0) {
  throw 'Git push failed. Check network/auth and ensure no files exceed 100 MB.'
}

Write-Host 'Publish complete.'