$ErrorActionPreference = 'Stop'
if (-not $env:BACKUP_PASSPHRASE) { throw 'Set BACKUP_PASSPHRASE before backing up.' }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path (Resolve-Path '.') "storage\app\backups\rotary-$stamp"
New-Item -ItemType Directory -Path $destination -Force | Out-Null
if ($env:DB_CONNECTION -eq 'pgsql') {
    $env:PGPASSWORD = $env:DB_PASSWORD
    pg_dump --format=custom --file="$destination\database.dump" --host=$env:DB_HOST --port=$env:DB_PORT --username=$env:DB_USERNAME $env:DB_DATABASE
} else {
    Copy-Item database\database.sqlite "$destination\database.sqlite"
}
Copy-Item .env "$destination\.env"
Compress-Archive -Path "$destination\*" -DestinationPath "$destination.zip"
openssl enc -aes-256-cbc -salt -pbkdf2 -in "$destination.zip" -out "$destination.zip.enc" -pass "env:BACKUP_PASSPHRASE"
Get-FileHash "$destination.zip.enc" | Select-Object Algorithm,Hash | Format-List | Out-File "$destination.sha256"
Remove-Item -Recurse -Force $destination,"$destination.zip"
Write-Host "Encrypted backup: $destination.zip.enc"
