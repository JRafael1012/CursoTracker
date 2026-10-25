$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
$env:NODE_ENV = "production"
npx next start --hostname 0.0.0.0 --port 3000
