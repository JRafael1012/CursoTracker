$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$log = Join-Path (Get-Location) "backups\backup.log"
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $log) | Out-Null
$stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$out = & node --env-file=.env scripts/backup-prisma.js 2>&1 | Out-String
$code = $LASTEXITCODE

if ($code -eq 0) {
  Add-Content -LiteralPath $log -Value "[$stamp] OK`n$out" -Encoding utf8
} else {
  Add-Content -LiteralPath $log -Value "[$stamp] ERROR (exit $code)`n$out" -Encoding utf8
}

exit $code
