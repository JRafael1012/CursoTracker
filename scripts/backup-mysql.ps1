# scripts/backup-mysql.ps1
# Backup de CursoTracker con mysqldump
# Uso: .\scripts\backup-mysql.ps1

param(
  [string]$Usuario = "root",
  [string]$Host = "localhost",
  [string]$Puerto = "3306",
  [string]$BaseDatos = "empresa",
  [string]$MysqlBin = "C:\xampp\mysql\bin"
)

$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $PSScriptRoot
$dirBackup = Join-Path $raiz "backups"
if (-not (Test-Path $dirBackup)) {
  New-Item -ItemType Directory -Path $dirBackup | Out-Null
}

$fecha = Get-Date -Format "yyyyMMdd_HHmmss"
$mysqldump = Join-Path $MysqlBin "mysqldump.exe"
$outSql = Join-Path $dirBackup "curso_tracker_$fecha.sql"

Write-Host "[BACKUP] Iniciando backup de '$BaseDatos'..."
Write-Host "[BACKUP] mysqldump: $mysqldump"
Write-Host "[BACKUP] Destino: $outSql"
Write-Host "[BACKUP] Usuario: $Usuario@$Host`:$Puerto"

$args = @(
  "-h$Host",
  "-P$Puerto",
  "-u$Usuario",
  "--routines",
  "--triggers",
  "--events",
  "--single-transaction",
  "--set-gtid-purged=OFF",
  "--hex-blob",
  $BaseDatos
)

# Se pedirá contraseña por prompt si es necesaria
& $mysqldump @args | Out-File -FilePath $outSql -Encoding UTF8

if (Test-Path $outSql) {
  $size = (Get-Item $outSql).Length
  Write-Host "[OK] Backup generado correctamente"
  Write-Host "[OK] Tamaño: $([math]::Round($size/1KB,2)) KB"
  Write-Host "[SIGUIENTE] Probar restauración en BD temporal según docs/backup-restore.md"
} else {
  Write-Error "[ERROR] No se ha generado el archivo de backup"
}
